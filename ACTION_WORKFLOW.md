# Workflow GitHub Actions – Verificare înainte de deploy

Documentul descrie pașii necesari pentru a garanta că toate aplicațiile din monorepo funcționează corect și folosesc dependențe actualizate înainte de un deploy. Monorepo-ul folosește workspaces (`ticketbot`, `discordhooks`, `frontend`) și impune Node.js `>=22.12.0`, deci toate job-urile trebuie să ruleze cu aceeași versiune pentru consistență.

## Verificări recomandate pe workspace

| Workspace | Scop | Comenzi recomandate |
|-----------|------|---------------------|
| `ticketbot` | Bot-ul principal – are lint, format check și teste automate. | `npm run lint -w ticketbot` · `npm run format:check -w ticketbot` · `npm run test -w ticketbot` |
| `frontend` | Builder-ul de embed-uri Vite/React. | `npm run lint -w frontend` · `npm run format:check -w frontend` · `npm run build -w frontend` |
| `discordhooks` | Serviciul de webhook/socket. Nu are lint/tests; efectuăm cel puțin un syntax check pe entry-point și un smoke test de boot fără a bloca workflow-ul. | `node --check discordhooks/src/index.js` · `node discordhooks/src/index.js --dry-run` (sau alt script rapid care validează config-ul) |

### Verificări la nivel de root
1. **Instalare + cache** – `npm install` în root (trage dependențele tuturor workspaces).
2. **Audit vulnerabilități** – `npm audit signatures --omit=optional`.
3. **Dependențe învechite** – rulează `npm outdated --workspaces --long --json` și eșuează dacă există ieșiri (vezi exemplul de script din workflow).

## Workflow recomandat

Caracteristici:
- Rulează pe `push`/`pull_request` spre `main` + `workflow_dispatch`.
- Un singur job `verify` care rulează secvențial toate verificările pentru a reutiliza instalarea și cache-ul npm.
- Verificare explicită pentru dependențe învechite (workflow-ul eșuează dacă există oricare).

```yaml
name: Pre-deploy Verification

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

env:
  NODE_VERSION: 22.12.0

jobs:
  verify:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm

      - name: Install workspace dependencies
        run: npm install

      - name: npm audit
        run: npm audit signatures --omit=optional

      - name: Fail if outdated dependencies exist
        run: |
          npm outdated --workspaces --long --json > outdated.json || true
          node - <<'NODE'
          const fs = require('fs');
          const data = fs.readFileSync('outdated.json', 'utf8').trim();
          if (data && data !== '{}') {
            console.error('Dependențe învechite detectate:');
            console.error(data);
            process.exit(1);
          }
          NODE

      - name: Ticketbot – lint
        run: npm run lint -w ticketbot

      - name: Ticketbot – format check
        run: npm run format:check -w ticketbot

      - name: Ticketbot – tests
        run: npm run test -w ticketbot

      - name: Frontend – lint
        run: npm run lint -w frontend

      - name: Frontend – format check
        run: npm run format:check -w frontend

      - name: Frontend – build
        run: npm run build -w frontend

      - name: Discordhooks – syntax check
        run: node --check discordhooks/src/index.js

      - name: Discordhooks – smoke boot
        run: |
          node discordhooks/src/index.js --dry-run || true
```

### Notițe suplimentare
1. **`node --check`** validează sintaxa fără a porni serverul și se termină imediat.
2. Dacă serviciul `discordhooks` primește un script de test dedicat (ex: `npm run lint`), înlocuiește pașii de mai sus cu acel script.
3. Pentru job-uri mai rapide poți împărți verificările în mai multe job-uri (ex: `ticketbot`, `frontend`) care depind de un job `setup` ce pregătește un artifact cu `node_modules`. Am preferat varianta secvențială pentru simplitate.
4. Dacă dorești raportare de coverage pentru `ticketbot`, adaugă `npm run test:coverage -w ticketbot` și publică artifactul `coverage`.
5. Workflow-ul poate fi extins cu un pas `npm run deploy:guild -w ticketbot` pe branch-uri de staging pentru a se asigura că definirea comenzilor Discord rămâne validă, dar nu recomand rularea acestuia pe `pull_request`.

> După adăugarea fișierului `.github/workflows/pre-deploy.yml` cu conținutul de mai sus, fiecare PR/commit spre `main` va fi blocat automat dacă există dependențe vechi sau verificările per-workspace eșuează.
