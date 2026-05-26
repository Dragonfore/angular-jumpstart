# Project Guidelines

## TypeScript

- **Strict mode is on in both frontend and backend.**
  - Frontend: `strict: true`, `strictTemplates: true`, `strictInjectionParameters: true` in `tsconfig.json`.
  - Backend: strict null checks enabled; `noImplicitAny` is currently `false` in the backend `tsconfig.json`.
- Prefer explicit return types on public service methods and controller handlers.
- Use `readonly` for injected dependencies in NestJS services.

---

## Angular Patterns

### Standalone components
All components are **standalone** — do not use `NgModule`. Import what you need directly in the component's `imports` array.

### Signals for state
Use `signal()` for component-local reactive state (loading flags, form submission state, data lists). Prefer signals over `BehaviorSubject` inside components.

```ts
// ✅ Preferred
readonly items = signal<Item[]>([]);
readonly loading = signal(false);

// ❌ Avoid inside components
items$ = new BehaviorSubject<Item[]>([]);
```

### Reactive forms
Use `FormBuilder` with typed forms. Prefer `fb.nonNullable.group(...)` to keep types tight.

### Lazy-loaded routes
All feature routes are lazy-loaded via dynamic `import()`. Add new features as lazily-loaded route entries in `app.routes.ts`.

```ts
{
  path: 'items',
  loadComponent: () => import('./features/items/items-list/items-list.component')
    .then(m => m.ItemsListComponent),
  canActivate: [authGuard],
}
```

### Functional guards and interceptors
Use `CanActivateFn` (not class-based guards) and `HttpInterceptorFn` (not `HttpInterceptor` class). Register interceptors in `app.config.ts` via `withInterceptors([...])`.

### Angular Material
Use Angular Material 21 components for UI. Import individual component modules (e.g. `MatButtonModule`, `MatInputModule`) in each standalone component that needs them.

---

## NestJS Patterns

### One module per resource
Each domain (auth, items) has its own module: `auth.module.ts`, `items.module.ts`. The `PrismaModule` is global — do **not** import it again in feature modules.

### DTOs with class-validator
All request bodies use DTO classes decorated with `class-validator`. The global `ValidationPipe` enforces them automatically.

```ts
export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

### Global defaults — don't override casually
These are registered in `main.ts` and apply to every route:

| Global | What it does |
|---|---|
| `ValidationPipe` (`whitelist: true`, `transform: true`) | Strips unknown fields; coerces DTO types |
| `JwtAuthGuard` via `APP_GUARD` | Protects all routes by default |
| `AllExceptionsFilter` | Standardizes error response shape |

Use `@Public()` to opt a route out of the JWT guard. Do not disable the global `ValidationPipe` on individual routes.

### Prisma for all DB access
Never write raw SQL. Use `this.prisma.<model>.*` methods. PrismaService is available via injection anywhere `PrismaModule` is visible (it's global, so everywhere).

---

## Git Conventions

- **Commit messages:** Follow [Conventional Commits](https://www.conventionalcommits.org/) format:
  ```
  feat(items): add pagination to items list
  fix(auth): handle expired token on profile fetch
  docs: update API reference for items endpoints
  ```
- **Branches:** Use feature branches (`feat/...`, `fix/...`, `chore/...`). Do not commit directly to `main`.
- **PRs:** Open a pull request against `main`; do not push directly.

---

## Testing

Testing infrastructure is configured but **no tests have been written yet**.

| Layer    | Framework | Config file             |
|----------|-----------|-------------------------|
| Frontend | Vitest    | `frontend/vitest.config.ts` |
| Backend  | Jest      | `backend/jest.config.*` |

When adding tests:
- Frontend unit tests: use Vitest + Angular Testing Library or Angular's `TestBed`.
- Backend unit tests: use Jest with NestJS testing utilities (`Test.createTestingModule`).
- Mock `PrismaService` in backend unit tests — do not hit a real database.
- E2E tests for the backend can use `@nestjs/testing` + `supertest`.
