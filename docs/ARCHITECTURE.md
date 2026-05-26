# Architecture

## Repository Layout

```
angular-jumpstart/
├── frontend/            # Angular 21 SPA
├── backend/             # NestJS API server
├── docs/                # Project documentation
├── docker-compose.yml   # PostgreSQL service
├── package.json         # Root workspace scripts (install:all, dev)
└── .env.example         # Root env template (documents ANGULAR_PORT)
```

---

## Tech Stack

| Layer       | Technology                          | Version |
|-------------|-------------------------------------|---------|
| Frontend    | Angular (standalone components)     | 21      |
| UI Library  | Angular Material                    | 21      |
| Backend     | NestJS                              | 11      |
| Auth        | Passport.js + passport-jwt          | —       |
| ORM         | Prisma                              | 7       |
| Database    | PostgreSQL                          | 15      |
| Runtime     | Node.js                             | 18/20+  |

---

## Data Flow

```
Browser
  └─► Angular (port 4200)
        └─► HTTP (no dev proxy — direct cross-origin requests)
              └─► NestJS (port 3000, global prefix /api)
                    └─► Controller
                          └─► Service
                                └─► Prisma Client
                                      └─► PostgreSQL (port 5432)
```

> **No proxy configured.** Frontend services use hardcoded `http://localhost:3000/api` base URLs. CORS is configured on the backend to allow `http://localhost:4200` (plus any additional origins set via `ALLOWED_ORIGINS`).

---

## Authentication Flow

1. User submits login or register form → Angular calls `POST /api/auth/login` or `POST /api/auth/register` (both marked `@Public()`, exempting them from the global JWT guard).
2. For login, NestJS's `LocalStrategy` validates credentials (bcrypt compare). For register, the password is hashed before storing.
3. Backend issues a JWT signed with `JWT_SECRET`, payload: `{ sub: userId, email, role }`, expiry controlled by `JWT_EXPIRY`.
4. Angular's `AuthService` stores the token in a `BehaviorSubject` (in-memory only — **token is lost on page refresh**).
5. The `AuthInterceptor` (`HttpInterceptorFn`) attaches `Authorization: Bearer <token>` to every outgoing HTTP request.
6. Backend's global `JwtAuthGuard` (registered via `APP_GUARD`) validates the token on every route that is not decorated with `@Public()`.
7. On a `401` response, the `AuthInterceptor` calls `authService.logout()`, which clears the token and redirects to `/login`.

---

## Frontend Structure (`frontend/src/app/`)

```
app/
├── core/
│   ├── auth/
│   │   ├── auth.service.ts          # Token storage (BehaviorSubject), login/logout
│   │   ├── auth.interceptor.ts      # Attaches Bearer token to requests
│   │   └── auth.guard.ts            # Functional CanActivateFn — protects routes
│   └── services/
│       └── items.service.ts         # Items CRUD HTTP calls
├── features/
│   ├── auth/
│   │   ├── login/                   # Login page component
│   │   └── register/                # Register page component
│   └── items/
│       ├── items-list/              # Items list component
│       └── item-form/               # Create / edit item form
├── shared/                          # Shared components / pipes
├── app.component.ts                 # Root shell component
└── app.routes.ts                    # Lazy-loaded route config
```

All components are **standalone** (no NgModules). Routes are lazy-loaded via dynamic imports.

---

## Backend Structure (`backend/src/`)

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts           # /api/auth/* endpoints
│   ├── auth.service.ts              # register, login, profile logic
│   ├── strategies/
│   │   ├── local.strategy.ts        # Passport LocalStrategy (username/password)
│   │   └── jwt.strategy.ts          # Passport JwtStrategy (Bearer token)
│   └── dto/                         # LoginDto, RegisterDto
├── items/
│   ├── items.module.ts
│   ├── items.controller.ts          # /api/items/* endpoints
│   ├── items.service.ts             # CRUD logic
│   └── dto/                         # CreateItemDto, UpdateItemDto
├── prisma/
│   ├── prisma.module.ts             # Global module — no need to import elsewhere
│   └── prisma.service.ts            # PrismaClient wrapper with lifecycle hooks
├── common/
│   └── filters/
│       └── all-exceptions.filter.ts # Global exception filter — standardized errors
├── decorators/
│   └── public.decorator.ts          # @Public() — skips JWT guard on a route
└── main.ts                          # Bootstrap: global pipe, guard, filter, CORS
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Standalone Angular components | Angular 21 best practice; eliminates NgModule boilerplate |
| Signals for component state | Modern Angular reactivity (`signal()` for loading, submitting, list data) |
| Functional guards & interceptors | `CanActivateFn` / `HttpInterceptorFn` — Angular 17+ recommended pattern |
| Global `JwtAuthGuard` via `APP_GUARD` | All routes protected by default; opt-out with `@Public()` — safer default |
| Global `PrismaModule` | Avoids re-importing in every feature module |
| Global `AllExceptionsFilter` | Uniform `{ statusCode, message, error, timestamp, path }` error shape |
| Global `ValidationPipe` (`whitelist: true`, `transform: true`) | Strips unknown fields; auto-coerces types from DTOs |
| In-memory token storage | Simplest approach; trade-off is token loss on refresh (no persistent session) |
