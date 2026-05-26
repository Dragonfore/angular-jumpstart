# Setup Guide

## Prerequisites

- **Node.js** 18.19+ or 20.9+
- **npm** (bundled with Node.js)
- **Docker** (used to run PostgreSQL via `docker-compose.yml`)

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and populate the values:

```sh
cp backend/.env.example backend/.env
```

| Variable          | File           | Default                                          | Description                                      |
|-------------------|----------------|--------------------------------------------------|--------------------------------------------------|
| `DATABASE_URL`    | `backend/.env` | `postgresql://user:password@localhost:5432/mydb` | PostgreSQL connection string for Prisma          |
| `PORT`            | `backend/.env` | `3000`                                           | Port the NestJS backend listens on               |
| `JWT_SECRET`      | `backend/.env` | `change-this-secret`                             | Secret used to sign and verify JWT tokens        |
| `JWT_EXPIRY`      | `backend/.env` | `24h`                                            | Token expiration duration (e.g. `1h`, `7d`)      |
| `ALLOWED_ORIGINS` | `backend/.env` | *(empty)*                                        | Additional CORS origins, comma-separated         |

> **Note:** The root `.env.example` also lists `ANGULAR_PORT=4200`, but the Angular CLI defaults to `4200` automatically — the frontend does not read this variable.

**⚠️ Important:** Change `JWT_SECRET` to a long, random string before running in any environment beyond local development.

---

## Step-by-Step Installation

### 1. Install dependencies

From the repo root, install both frontend and backend in one command:

```sh
npm run install:all
```

Or install manually:

```sh
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure environment

```sh
cp backend/.env.example backend/.env
# Open backend/.env and set JWT_SECRET to a real value
```

### 3. Start the database

```sh
docker-compose up -d
```

This starts a PostgreSQL 15 container on port `5432` using the credentials in `docker-compose.yml`.

### 4. Run database migrations

```sh
cd backend
npx prisma migrate dev
```

This applies all pending migrations and generates the Prisma Client.

### 5. (Optional) Seed the database

```sh
cd backend
npx prisma db seed
```

Populates the database with initial data defined in `prisma/seed.ts`.

### 6. Start development servers

From the repo root:

```sh
npm run dev
```

This runs both the Angular frontend (port `4200`) and the NestJS backend (port `3000`) concurrently.

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `Port 3000 already in use` | Another process on port 3000 | Kill the process or change `PORT` in `backend/.env` |
| `Port 4200 already in use` | Another Angular dev server running | Kill it or run `ng serve --port 4201` |
| `Connection refused` on migration | Docker not running or DB not ready | Run `docker-compose up -d` and wait a few seconds |
| `Migration failed` | Database doesn't exist yet | Ensure the DB container started (`docker ps`), then retry |
| `Invalid token` / 401 errors | `JWT_SECRET` not set or changed | Verify `JWT_SECRET` in `backend/.env`; re-login after any change |
