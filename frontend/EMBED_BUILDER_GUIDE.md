# Embed Builder (Frontend-only) — Guide

## Goal
Build a web app that lets you create Discord-style embeds (message payloads), preview them, and save them locally so you can re-open and edit later.

## Scope (v1)
- Create/edit a message payload:
  - `content`
  - optional `username`, `avatar_url`
  - up to 10 `embeds`
- Live preview (Discord-like)
- Local “database” to save, update, duplicate, delete embed projects
- Import/export JSON

## Non-goals (for now)
- Discord bot features
- User accounts / cloud sync
- Collaboration

## Recommended Tech Stack
- App scaffold: Vite + React + TypeScript
- Styling: TailwindCSS
- Local DB: IndexedDB via Dexie
- Validation: zod (validate payload + enforce Discord limits)

## Architecture Overview
Keep the frontend as its own app inside `frontend/` (separate `package.json`). Treat it like a standalone product.

### Directory Layout
```
frontend/
  src/
    app/
      App.tsx
      routes/
      layout/
    features/
      projects/
        components/
        hooks/
        storage/
        types.ts
      embedEditor/
        components/
        hooks/
        preview/
        types.ts
        validators.ts
    shared/
      components/
      hooks/
      lib/
        discord/
        storage/
      styles/
```

### Responsibility Split
- `features/embedEditor/*`
  - Editing UI + local state for the current payload
  - Validation (Discord constraints)
  - Preview rendering
- `features/projects/*`
  - Project list
  - CRUD actions (create/update/delete/duplicate)
  - Persistence layer (IndexedDB)
- `shared/*`
  - Reusable UI components
  - Shared utilities (date formatting, ids, etc.)

## Data Model
We store “projects” (saved payloads). Payload format should match Discord webhook body shape (so later you can send it as-is).

### `EmbedProject`
- `id`: string (uuid)
- `name`: string
- `createdAt`: number (epoch ms)
- `updatedAt`: number (epoch ms)
- `payload`: object
  - `content?: string`
  - `username?: string`
  - `avatar_url?: string`
  - `embeds: Embed[]`

## Local Database (IndexedDB)
Use Dexie to keep it simple and reliable.

### Suggested tables
- `projects`
  - primary key: `id`
  - indexes: `updatedAt`, `name`

### Migration rule
If we ever change the stored schema, increment Dexie DB version and add a migration.

## UI (v1)
- Main layout: 3 columns
  - Left: Projects
  - Center: Editor
  - Right: Preview

### Required screens/components
- Projects list + search
- “New project” button
- Editor sections:
  - Message (content, username, avatar)
  - Embeds list (add/remove/reorder)
  - Embed editor (title, description, color, url, author, footer, image/thumbnail, fields)
- Preview component (Discord-like card)
- Import/export JSON

## Milestones (implementation order)
1. Scaffold `frontend/` app (Vite + React + TS) + Tailwind
2. Define types + zod schemas (Discord payload + constraints)
3. Build Project CRUD with IndexedDB (create/update/delete/duplicate)
4. Build Editor UI (forms + controlled state)
5. Build Preview renderer
6. Wire autosave + “unsaved changes” handling
7. Import/export JSON

## Conventions
- Keep business logic in `hooks/` and `lib/` rather than inside components.
- Prefer small, focused components.
- Validate on edit + on save (show clear errors).

## Quality Gates
- No secrets stored in repo
- No logging of webhook URLs if we add “Send” later
- Basic accessibility: labels, focus states, keyboard navigation for core actions
