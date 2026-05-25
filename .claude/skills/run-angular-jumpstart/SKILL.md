---
name: run-angular-jumpstart
description: Run, start, build, screenshot, or test the angular-jumpstart full-stack app (Angular 21 frontend + NestJS backend). Use this skill to launch the app, take a screenshot, verify a change works, or smoke-test both services.
---

# Run: angular-jumpstart

Angular 21 (Vite dev server) frontend + NestJS 11 (Prisma + PostgreSQL) backend.
The driver is `.claude/skills/run-angular-jumpstart/driver.sh`. It builds the frontend,
serves it as a static bundle on port 4201, and uses Python playwright (via the ms-playwright
chromium binary already cached at `~/.cache/ms-playwright/`) to take screenshots headlessly.
The NestJS backend runs on port 3000.

All paths below are relative to the repo root (`/home/dragonfore/repo/angular-jumpstart`).

---

## Prerequisites

Python playwright is already installed (tested in the `data-demystify` venv). Node 24 and
npm 11 are on the PATH. No additional apt packages needed.

```bash
# Verify playwright + chromium are present:
python3 -c "from playwright.sync_api import sync_playwright; print('ok')"
# => ok
```

---

## Build

```bash
# Frontend (Angular):
cd frontend && node_modules/.bin/ng build
# Output: frontend/dist/frontend/browser/

# Backend (NestJS):
cd backend && node_modules/.bin/nest build
# Output: backend/dist/src/main.js
```

Both complete in < 10 seconds on a warm machine.

---

## Run (agent path) — use the driver

```bash
# Full smoke: build frontend, start static server, start backend, screenshot, curl backend:
bash .claude/skills/run-angular-jumpstart/driver.sh smoke

# Screenshot only (assumes frontend already serving on 4201):
bash .claude/skills/run-angular-jumpstart/driver.sh screenshot
# Screenshot lands at: /tmp/jumpstart-screenshot.png

# Start frontend static server only (port 4201):
bash .claude/skills/run-angular-jumpstart/driver.sh start-frontend

# Start Angular dev server (port 4202, hot-reload):
bash .claude/skills/run-angular-jumpstart/driver.sh start-dev-server

# Start NestJS backend only (port 3000):
bash .claude/skills/run-angular-jumpstart/driver.sh start-backend

# Stop everything started by this driver:
bash .claude/skills/run-angular-jumpstart/driver.sh stop
```

To screenshot an already-running URL:
```bash
bash .claude/skills/run-angular-jumpstart/driver.sh screenshot http://localhost:4202/
```

Screenshots always land at `/tmp/jumpstart-screenshot.png`.

---

## Run (human path)

Two terminals:

```bash
# Terminal 1 — backend:
cd backend && npm run start:dev   # watches, restarts on change; port 3000

# Terminal 2 — frontend:
cd frontend && npm start          # ng serve; port 4200 (hot-reload)
```

`ng serve` opens `http://localhost:4200`. Not useful headless — use the driver instead.

---

## Database

The backend uses PostgreSQL via Prisma. **The app starts fine without a DB** — the Prisma
pool is lazy and only connects when a query is actually executed. The template's
`AppService.getHello()` never queries the DB, so `GET /` works without a database.

To run with a real database:
```bash
docker-compose up -d       # starts postgres:15 on port 5432
# credentials: user=user password=password db=mydb
export DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
cd backend && npx prisma migrate dev
npm run start:dev
```

Or use the `start-db.sh` script if running with Podman instead of Docker.

---

## Test

```bash
# Backend (Jest):
cd backend && npm test
# => 1 suite, 1 test, all pass

# Frontend: ng test uses Karma (needs a real browser — skip headless)
# vitest run also fails (spec file uses Angular/Jasmine style, not vitest globals)
# No frontend unit test runner works headlessly; rely on the driver smoke test instead.
```

---

## Gotchas

- **Port 4200 is the default for `ng serve`** and may already be in use by a previous
  session. The driver uses port 4201 (static) and 4202 (dev server) to avoid conflicts.
  If you need port 4200 freed: `pkill -f "ng serve"`.

- **`npm start` in the repo root is a no-op** (`package.json` is `{}`). Always `cd frontend`
  or `cd backend` first.

- **chromium-cli is not installed.** Screenshots use Python playwright (`from playwright.sync_api
  import sync_playwright`) with the chromium binary cached at
  `~/.cache/ms-playwright/chromium-1194/chrome-linux/chrome`. This is playwright from the
  `data-demystify` project's venv — it's on the system Python path.

- **`npx vitest run` fails with `describe is not defined`** in the frontend. The spec file
  (`app.spec.ts`) uses Angular's `TestBed` / Jasmine API, not vitest globals. The canonical
  runner is `ng test`, which requires Karma + a real browser. Don't use vitest for frontend tests.

- **Backend starts without `DATABASE_URL`** — pool creation doesn't connect; no crash on
  startup. Only fails at actual DB query time. `GET /` (`AppService.getHello()`) never
  queries the DB, so smoke tests pass without Postgres.

- **`nest start --watch` (the default `start:dev`) compiles on-the-fly**; first start takes
  ~5s. `node dist/src/main.js` (from `npm run build`) starts in ~300ms — use that for
  automated testing.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `EADDRINUSE :::3000` | `pkill -f "node dist/src/main"` or `pkill -f "nest start"` |
| `EADDRINUSE :::4201` | `pkill -f "python3 -m http.server 4201"` |
| `python3 -m http.server: Address already in use` on 4201 | Same — pkill python http.server |
| Playwright `Error: browser was not found` | `python3 -c "from playwright.sync_api import sync_playwright"` — if ImportError, activate the data-demystify venv: `source /home/dragonfore/repo/data-demystify/.venv/bin/activate` |
| Angular build fails: `Cannot find module '@angular/core'` | `cd frontend && npm install` |
| Backend `Cannot find module '@nestjs/core'` | `cd backend && npm install` |
