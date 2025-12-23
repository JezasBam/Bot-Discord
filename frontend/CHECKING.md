---
trigger: always_on
---

# Frontend Embed Builder — Checking Rules

## Response Discipline Rule
In every response that includes code changes:
- Start with 2–5 bullet points prefixed with "Checked:"
- Bullets must confirm:
  - Checked existing project files / structure (especially `frontend/`)
  - Checked module system (TypeScript/JS, ESM) and build tool (Vite/React)
  - Checked dependency versions in `frontend/package.json`
  - Checked storage approach (IndexedDB/Dexie) and data migration plan
  - Checked security basics (no secret leakage, no logging sensitive URLs)

## Initial Project Check
- Always implement by editing files (do not paste large code blocks in chat unless asked).

## Best Practices Gate (before writing code)
Before generating or applying code, verify:
- correctness against Discord embed payload constraints (limits for embeds/fields/lengths)
- reliability (clear error states, schema validation, safe persistence)
- maintainability (separation: UI vs business logic vs storage)
- UX (fast feedback, preview, keyboard-friendly forms)
- accessibility basics (labels, focus, readable contrast)

## Frontend-Specific Checks
### Tech / Tooling
- [ ] Confirm `frontend/` is a standalone app (own `package.json`).
- [ ] Confirm TypeScript is enabled and `strict` is preferred.
- [ ] Confirm formatting/linting strategy for `frontend/` (Prettier/ESLint or Biome).

### Storage
- [ ] Prefer IndexedDB (Dexie) for persistence.
- [ ] Never store secrets (if webhook sending is added later, do not persist URLs by default).
- [ ] Define a stable `EmbedProject` schema and use a single repository layer.
- [ ] If schema changes, bump IndexedDB version and add a migration.

### Validation
- [ ] Validate payload with a schema (zod).
- [ ] Surface validation errors in UI next to the field (not only console).
- [ ] Enforce Discord limits (e.g., max 10 embeds, max fields per embed, max lengths).

### Performance
- [ ] Avoid expensive re-renders in preview (memoize derived preview model).
- [ ] Keep large text inputs controlled but efficient.

### Security
- [ ] Do not log or persist any sensitive URLs.
- [ ] No external requests by default.

## Output / Change Management
- Keep changes minimal and justified.
- Prefer simple, readable solutions over heavy abstractions.
- If information is missing, search the codebase first.
