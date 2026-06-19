# AGENTS.md — Daily Planner

> AI coding agent instructions for the Daily Planner Electron + React + TypeScript codebase.

## Build & Dev Commands

```bash
npm run dev          # Vite dev server + Electron (concurrently, wait-on)
npm run lint         # TypeScript type-check only: tsc --noEmit
npm run build        # Full build: icons → esbuild electron → tsc → vite build
npm run build:win    # Build + electron-builder NSIS for Windows
npm run build:electron  # esbuild main.ts & preload.ts → dist-electron/*.cjs
```

- **No test framework** exists. No `*.test.*` / `*.spec.*` files.
- **No ESLint** — linting is purely `tsc --noEmit` with strict settings (see below).
- Dev requires `npm run build:electron` first, then Vite on `http://localhost:5173`.

## Architecture

| Layer | Tech | Key Detail |
|-------|------|------------|
| Desktop | Electron 33 | `contextIsolation: true`, `nodeIntegration: false`, `sandbox: false` |
| Frontend | React 19 + TS + Vite 6 | HashRouter (required for `file://` protocol) |
| CSS | Tailwind CSS 3 (`darkMode: class`) + custom `warm-*` palette |
| Charts | Recharts | |
| DB | lowdb v5 (ESM-only) | `tasks.json` in `app.getPath('userData')` |
| State | React Context (`TaskContext`) | No Redux/Zustand |

## Data Model — "Everything is a Task"

All data is a single `Task[]` array. See [src/types/task.ts](src/types/task.ts).

- **Non-repeating tasks**: scheduled via `scheduledDate` (ISO) + `scheduledTime` ("HH:mm").
- **Repeating tasks**: `repeatEnabled: true` + `repeatConfig.weekdays: number[]`. These have NO `scheduledDate` — they are *virtually expanded* at render time per-date via `expandForDate()`.
- **Virtual IDs**: Expanded repeat tasks get IDs like `{originalId}--rt--{date}`. `parseRepeatVirtualId()` decodes these. Completion is tracked via `repeatConfig.completedDates: string[]`.
- **Undated tasks**: No `scheduledDate` + not repeat = inbox/unscheduled.

### State Management Pattern

`TaskContext.tsx` holds all state. Operations follow **optimistic update** pattern:
1. Mutate React state immediately
2. Persist to lowdb asynchronously via `window.electronAPI`
3. On failure, roll back state (implemented in `addTask`, partial in `updateTask`)

## TypeScript — Strict Settings

```jsonc
// tsconfig.json
{ "strict": true, "noUnusedLocals": true, "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true }
```

- Path alias `@/` → `src/` (configured in both tsconfig `paths` and vite `resolve.alias`).
- `tsconfig.json` includes both `src/` and `electron/` directories.
- `tsconfig.node.json` covers `vite.config.ts` only (composite project reference).

## Electron IPC Rules

- Renderer has **no Node.js access** — all system APIs go through `window.electronAPI` (exposed via preload `contextBridge`).
- Uses `ipcRenderer.invoke` / `ipcMain.handle` (Promise-based, not `send`/`on`).
- Preload imports types from `src/types/task.ts` (type-only, erased by esbuild). **Never import runtime code** from `src/` into preload.
- Window close is intercepted — hides to tray unless `isQuitting = true`.

## Key Files

| File | Role |
|------|------|
| [src/types/task.ts](src/types/task.ts) | Task interface + `localDateStr()` utility |
| [src/context/TaskContext.tsx](src/context/TaskContext.tsx) | All state, CRUD, computed views |
| [electron/main.ts](electron/main.ts) | Window, tray, notification timer |
| [electron/preload.ts](electron/preload.ts) | contextBridge API surface |
| [electron/database.ts](electron/database.ts) | lowdb init, migration, CRUD |
| [src/services/theme.ts](src/services/theme.ts) | Dark mode toggle, 8 preset theme colors |

## CSS Conventions

- Tailwind `darkMode: 'class'` — toggle `.dark` on `<html>`.
- Custom utility classes in `@layer components`: `.glass`, `.glass-card`, `.gradient-card`, `.check-box`, `.input`.
- Custom animations: `check`, `fadeIn`, `slideUp`, `popIn`, `modalIn`, `float`, `pulseRing`, `strike`.
- Theme colors set CSS custom properties (`--color-accent-*`) used for SVG gradients.

## Gotchas

1. **`noUnusedLocals`** — unused imports/vars break `tsc --noEmit`. Always remove them.
2. **lowdb is ESM-only** — `electron/database.ts` uses dynamic `await import('lowdb')`. Must stay external in esbuild config.
3. **Repeat task IDs** contain `--rt--` separator. Don't use this in user-facing strings.
4. **Monday vs Sunday**: `getDay()` returns 0=Sunday, but the app UI treats Monday as first day of week (offset calculation: `dayOfWeek === 0 ? -6 : 1 - dayOfWeek`).
5. **Date handling**: Always use `localDateStr()` to construct dates from parts — avoids timezone issues.
6. **Window focus reload**: Tasks reload from DB on every `window.focus` event for cross-window sync.
