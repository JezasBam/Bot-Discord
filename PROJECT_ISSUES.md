# Project Issues & Refactoring Guide

## 📋 Overview

This document contains a comprehensive analysis of all issues, refactoring suggestions, and optimizations for the Discord Bot monorepo project.

**Project Structure:**
- `ticketbot/` - Discord ticket system bot
- `discordhooks/` - API server for Discord webhook management
- `frontend/` - React embed builder UI

---

## 🔴 Critical Issues (High Priority)

### 1. `discordhooks/src/index.js` - Login Retry Destroys Client

**Problem:** În `loginWithRetry()`, după un eșec de login, codul apelează `client.destroy()` și apoi încearcă din nou `client.login()` pe același client. Un client distrus nu poate fi reutilizat.

**File:** `discordhooks/src/index.js:56-60`

```javascript
// PROBLEMA - client.destroy() face clientul inutilizabil
try {
  client.destroy();
} catch {
  // ignore
}
```

**Fix:** Elimină `client.destroy()` din loop-ul de retry (la fel cum am făcut deja în `ticketbot`).

```javascript
// Șterge complet blocul try { client.destroy() } catch {}
// Doar așteaptă și reîncearcă login-ul
```

---

### 2. `discordhooks/src/index.js` - `process.exit()` în Login Retry

**Problem:** Folosirea `process.exit(1)` oprește brusc procesul fără cleanup. În context monorepo cu `concurrently`, asta poate lăsa celelalte procese într-o stare inconsistentă.

**File:** `discordhooks/src/index.js:48-54`

**Refactor:**
```javascript
// În loc de process.exit(1), setează process.exitCode și return
if (isInvalidTokenError(err)) {
  console.error('Invalid token - cannot retry');
  process.exitCode = 1;
  return; // Nu mai încerca
}
```

---

### 3. Frontend - Missing ChevronLeft Import

**Problem:** `ChevronLeft` este definit manual ca componentă SVG în loc să fie importat din `lucide-react`.

**File:** `frontend/src/features/discord/components/ChannelsSidebar.tsx:350-365`

**Fix:** Înlocuiește funcția custom cu import:
```typescript
import { ChevronLeft } from 'lucide-react';
// Șterge funcția ChevronLeft definită manual la sfârșitul fișierului
```

---

## 🟠 Medium Priority Issues

### 4. Duplicate Code - Network Error Detection

**Problem:** Funcțiile `isTransientNetworkError()` și `isInvalidTokenError()` sunt duplicate în:
- `ticketbot/src/bot.js`
- `discordhooks/src/index.js`

**Refactor:** Creează un modul shared:

```javascript
// shared/utils/network-errors.js
export function isTransientNetworkError(err) {
  const code = err?.code;
  return code === 'ENOTFOUND' || code === 'EAI_AGAIN' || code === 'ECONNRESET' || code === 'ETIMEDOUT';
}

export function isInvalidTokenError(err) {
  if (err?.code === 'TokenInvalid') return true;
  const msg = typeof err?.message === 'string' ? err.message : '';
  return /invalid token/i.test(msg);
}
```

---

### 5. `ticketbot/src/storage/db.js` - No Error Handling for Corrupt JSON

**Problem:** Dacă `db.json` este corupt, `JSON.parse()` aruncă o eroare care nu este tratată specific.

**File:** `ticketbot/src/storage/db.js:14-17`

**Refactor:**
```javascript
async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (parseErr) {
    // Backup corrupt file and return initial state
    const backupPath = `${filePath}.corrupt.${Date.now()}`;
    await fs.rename(filePath, backupPath);
    console.error(`Corrupt DB file backed up to ${backupPath}`);
    return { version: 1, guilds: {} };
  }
}
```

---

### 6. Frontend - API URL Hardcoded

**Problem:** URL-ul API este hardcodat în multiple locuri.

**Files:**
- `frontend/src/api/client.ts:1` → `const API_BASE = 'http://localhost:4000/api';`
- `frontend/src/features/discord/hooks/useSocket.ts:4` → `const SOCKET_URL = 'http://localhost:4000';`

**Refactor:** Folosește variabile de environment:
```typescript
// frontend/src/config/env.ts
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
```

---

### 7. `discordhooks/src/api/server.js` - CORS Origins Hardcoded

**Problem:** Lista de origini CORS este hardcodată și repetată.

**File:** `discordhooks/src/api/server.js:9`

**Refactor:**
```javascript
// config/cors.js
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:3004',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3004'
];
```

---

### 8. Frontend - `useChannelMessages.ts` - Stale Closure in deleteMessage

**Problem:** `deleteMessage` folosește `selectedMessageId` din closure, dar nu este în dependency array în mod optim.

**File:** `frontend/src/features/discord/hooks/useChannelMessages.ts:78-94`

**Current:**
```typescript
const deleteMessage = useCallback(async (messageId: string, channelId: string, keepSelection = false) => {
  // ...
  if (!keepSelection && selectedMessageId === messageId) {
    setSelectedMessageId(null);
  }
}, [selectedMessageId]); // ← Dependency pe selectedMessageId
```

**Refactor:** Folosește functional update pentru a evita dependency:
```typescript
const deleteMessage = useCallback(async (messageId: string, channelId: string, keepSelection = false) => {
  // ...
  if (!keepSelection) {
    setSelectedMessageId((prev) => prev === messageId ? null : prev);
  }
}, []); // ← No external dependencies
```

---

### 9. `ticketbot/src/features/tickets/index.js` - Large File (563 lines)

**Problem:** Fișierul este prea mare și face prea multe lucruri.

**Refactor:** Împarte în module mai mici:

```
features/tickets/
├── index.js              # Re-exports
├── handlers/
│   ├── buttonHandler.js  # handleTicketButton
│   ├── modalHandler.js   # handleTicketModalSubmit
│   └── joinHandler.js    # handleJoin
├── actions/
│   ├── createTicket.js   # createTicketFromModal
│   ├── closeTicket.js    # handleCloseConfirm
│   └── showModals.js     # showCreateModal, showCloseModal
├── cooldown.js           # startCooldownCleanup, stopCooldownCleanup
└── utils.js              # getTicketName, resolveExistingThread, sendFilesInBatches
```

---

### 10. Frontend - EmbedSection Uses Array Index as Key

**Problem:** În `EmbedEditor.tsx`, embeds folosesc index ca key, ceea ce poate cauza probleme la reordonare.

**File:** `frontend/src/features/embedEditor/components/EmbedEditor.tsx:124`

```typescript
{payload.embeds.map((embed, index) => (
  <EmbedSection key={index} ... />  // ← Index as key
))}
```

**Refactor:** Adaugă un `id` unic fiecărui embed:
```typescript
// types.ts
export interface Embed {
  id: string; // UUID
  title?: string;
  // ...
}

// utils/payload.ts
export function createEmptyEmbed(): Embed {
  return { id: crypto.randomUUID(), /* ... */ };
}
```

---

## 🟡 Low Priority / Optimizations

### 11. `ticketbot/src/core/logger.js` - Consider Using Pino

**Current:** Custom logger implementation.

**Optimization:** Pentru producție, consider using `pino` - mai rapid și cu mai multe features:
```javascript
import pino from 'pino';
const logger = pino({ level: 'info' });
```

---

### 12. Frontend - EmbedPreview Fetches Bot Info on Every Mount

**Problem:** `EmbedPreview` face un API call la fiecare mount pentru bot info.

**File:** `frontend/src/features/embedEditor/preview/EmbedPreview.tsx:16-29`

**Optimization:** Mută fetch-ul într-un context sau hook la nivel de App:
```typescript
// hooks/useBotInfo.ts
export function useBotInfo() {
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  
  useEffect(() => {
    api.bot().then(setBotInfo).catch(() => {});
  }, []);
  
  return botInfo;
}

// App.tsx - fetch once, pass down as prop
```

---

### 13. `discordhooks/src/api/routes/channels.js` - No Pagination for Messages

**Problem:** `channel.messages.fetch({ limit })` nu suportă pagination pentru canale cu multe mesaje.

**File:** `discordhooks/src/api/routes/channels.js:37`

**Optimization:** Adaugă suport pentru `before`/`after` cursors:
```javascript
router.get('/:channelId/messages', async (req, res) => {
  const { limit = 50, hasEmbeds, before, after } = req.query;
  
  const messages = await channel.messages.fetch({
    limit: Math.min(Number(limit), 100),
    before: before || undefined,
    after: after || undefined,
  });
  // ...
});
```

---

### 14. Frontend - Excessive Re-renders in App.tsx

**Problem:** `handleSave` este recreată la fiecare render din cauza dependențelor.

**Optimization:** Folosește `useCallback` cu referințe stabile sau mută logica într-un custom hook:
```typescript
// hooks/useEmbedSave.ts
export function useEmbedSave(channelId, messageId, payload) {
  return useCallback(async () => {
    // save logic
  }, [channelId, messageId, payload]);
}
```

---

### 15. `ticketbot/src/config/index.js` - Config Caching Global

**Problem:** `cachedConfig` este global și nu se resetează la hot reload în development.

**File:** `ticketbot/src/config/index.js:43`

**Note:** Acest lucru este ok pentru producție, dar poate cauza probleme în development. Consider:
```javascript
export function resetConfigCache() {
  cachedConfig = null;
}
```

---

### 16. Type Safety - discordhooks Uses JavaScript

**Problem:** `discordhooks` este în JavaScript pur, fără type checking.

**Optimization:** Migrează gradual la TypeScript pentru consistency cu frontend:
1. Adaugă `tsconfig.json`
2. Redenumește `.js` → `.ts`
3. Adaugă tipuri pentru request/response

---

### 17. Frontend - No Error Boundaries

**Problem:** Frontend-ul nu are Error Boundaries pentru a prinde erori de rendering.

**Optimization:**
```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

### 18. `ticketbot` - No Health Check Endpoint

**Problem:** `ticketbot` nu expune un health check, făcând monitoring-ul dificil.

**Optimization:** Adaugă un mic HTTP server pentru health checks:
```javascript
// core/health.js
import http from 'http';

export function startHealthServer(client, port = 4001) {
  http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ ready: client.isReady() }));
    }
  }).listen(port);
}
```

---

### 19. Frontend - Validators Not Used in Save

**Problem:** `validators.ts` definește `validatePayload()` dar nu este folosit în `handleSave`.

**File:** `frontend/src/features/embedEditor/validators.ts`

**Optimization:** Integrează Zod validation în save flow:
```typescript
const errors = validatePayload(localPayload);
if (errors.length > 0) {
  setSaveError(errors.map(e => e.message).join(', '));
  return;
}
```

---

### 20. Testing - No Tests for discordhooks

**Problem:** `discordhooks` nu are niciun test.

**Optimization:** Adaugă tests cu `vitest` (deja folosit în ticketbot):
```javascript
// discordhooks/src/api/__tests__/routes.test.js
describe('API Routes', () => {
  it('should return health status', async () => {
    // test /api/health
  });
});
```

---

## 📁 Recommended File Structure Changes

```
Bot Discord/
├── shared/                    # NEW - Shared utilities
│   └── utils/
│       ├── network-errors.js
│       └── sleep.js
├── ticketbot/
│   └── src/
│       └── features/tickets/  # REFACTOR - Split large file
│           ├── handlers/
│           ├── actions/
│           └── utils/
├── discordhooks/
│   └── src/
│       ├── config/           # NEW - Configuration
│       │   └── cors.js
│       └── types/            # NEW - TypeScript types (future)
└── frontend/
    └── src/
        ├── config/           # NEW - Environment config
        │   └── env.ts
        └── components/       # NEW - Shared components
            └── ErrorBoundary.tsx
```

---

## ✅ Quick Fixes Checklist

- [ ] Remove `client.destroy()` from `discordhooks/src/index.js` retry loop
- [ ] Replace `process.exit(1)` with `process.exitCode = 1` + return
- [ ] Import `ChevronLeft` from `lucide-react` instead of custom SVG
- [ ] Add unique `id` to Embed type and use as React key
- [ ] Move API_BASE and SOCKET_URL to environment variables
- [ ] Add Error Boundary to frontend
- [ ] Use Zod validators in save flow

---

## 📊 Summary

| Priority | Count | Description |
|----------|-------|-------------|
| 🔴 Critical | 3 | Bugs that can break functionality |
| 🟠 Medium | 7 | Code quality and maintainability |
| 🟡 Low | 10 | Optimizations and improvements |

**Total Issues:** 20

---

*Generated: December 2024*
