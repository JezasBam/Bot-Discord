# Copilot / AI Agent Instructions — Bot-Discord

Quick, actionable notes for an AI code assistant working in this repo.

## Big picture
- This is a small monorepo with three cooperating apps:
  - `ticketbot/` — Discord bot (commands, events, ticket feature). Uses file-based DB at `data/db.json`.
  - `discordhooks/` — Light API server + Discord client that exposes REST + Socket.IO events for the frontend. Starts at port 4000 (`startApiServer(..., 4000)`).
  - `frontend/` — React + Vite embed builder (standalone app). Uses IndexedDB (Dexie) for local persistence.
- Data/flow: `discordhooks` listens to Discord events, emits Socket.IO events and serves `/api/*` endpoints; `frontend` talks to `discordhooks` at `http://localhost:4000/api` and subscribes to real-time updates.

## Local dev & common commands
- Install & run everything: `npm install` then `npm run dev` (root) — runs all three concurrently.
- Run a single package:
  - `npm run ticketbot:dev` or from folder: `npm run dev` inside `ticketbot/`.
  - `npm run hooks:dev` or from folder: `npm run dev` inside `discordhooks/`.
  - `npm run frontend:dev` or `npm run dev` inside `frontend/` (Vite).
- Build frontend: `npm run frontend:build` (root) or `cd frontend && npm run build`.
- Tests:
  - `ticketbot` uses Vitest: `cd ticketbot && npm run test` (or `npm run test -w ticketbot`). Tests are ESM, follow `vitest` conventions.
- Lint/format checks:
  - `ticketbot` and `frontend` include `lint` and `format` scripts (eslint + prettier). `ticketbot` has `prestart` that runs `lint`, `format:check`, and `test`.
- Node version: engine requires Node >= 22.12.0. Use that or newer when running locally or in CI.

## Environment & config
- Both `ticketbot` and `discordhooks` use dotenv to load `.env` from the repository root (see `src/config/index.js` and `discordhooks/src/index.js`). Required env vars for bot to run:
  - `DISCORD_TOKEN` (required)
  - `CLIENT_ID` (required)
  - `GUILD_ID` (optional, used for guild-scoped command deployment)
- Sensitive values must NOT be committed. Treat token and client id as secrets.

## Project-specific conventions & patterns
- ESM + `type: "module"` across the repo. Prefer `import` / `export` and native promises.
- Command & event modules are dynamically loaded by loader utilities:
  - Commands export `data` (SlashCommandBuilder) and `execute(interaction)` (see `ticketbot/src/commands/ping.js`).
  - Events export `name`, `once` (bool), and `execute(...args)` (see `ticketbot/src/events/ready.js`).
- `ticketbot` storage is file-based JSON: `data/db.json`. Writes are atomic via temp rename and serialized via an enqueue queue (`enqueueDb`) to avoid races.
- `discordhooks` exposes these REST endpoints and socket events (check `discordhooks/src/api/server.js`):
  - GET `/api/health` — health & basic bot state
  - GET `/api/bot` — bot user info
  - `/api/guilds`, `/api/channels`, `/api/messages` routers implemented
  - Socket.IO events: `channelUpdate` and `messageUpdate` are emitted.
- `frontend/src/api/client.ts` expects the API base at `http://localhost:4000/api` and uses JSON fetch wrappers that throw on non-OK responses.

## Testing & quality gates
- `ticketbot` tests are run via Vitest and are part of `prestart` (CI should run tests before starting or deploying bot).
- Frontend has a `CHECKING.md` and `EMBED_BUILDER_GUIDE.md` which must be followed by code changes to the embed builder (see `frontend/CHECKING.md` for specific response discipline rules).
- When changing persisted schemas (frontend Dexie or `data/db.json`), add a migration path and bump DB version.

## Typical tasks & examples for an AI agent
- Add a new slash command:
  - Create `ticketbot/src/commands/<name>.js` exporting `data` (SlashCommandBuilder) and `execute`.
  - Ensure `loaders/commands.js` will include it (loader scans files automatically).
  - Update tests (Vitest) under `ticketbot/tests/` and add a smoke test if applicable.
- Fix or add an API route in `discordhooks`:
  - Add a new router under `discordhooks/src/api/routes/` and mount it in `server.js`.
  - Add tests by hitting the route in isolation (either node test harness or integration test hitting local server).
- Frontend changes:
  - Follow the `EMBED_BUILDER_GUIDE.md` architecture and `CHECKING.md` rules (start responses with `Checked:` when generating PRs that modify frontend files).

## What to avoid / safety notes
- Do not expose `DISCORD_TOKEN` or other tokens—never print them into logs or commit them.
- Avoid assuming a DB server exists — `ticketbot` uses local JSON; do not introduce hidden external state without documenting and migrating existing data.
- Follow i18n patterns (`ticketbot/src/features/tickets/i18n.js`) — strings are regionalized (en/ro currently).

---
If any of these points are unclear or you want me to expand a specific section (examples for creating commands, tests, or API routes), tell me which part to expand and I’ll iterate. ✅