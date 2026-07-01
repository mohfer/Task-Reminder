# AGENTS.md

Repo: `D:\Project\task-reminder\app` — monorepo with `client/` (React 18 + Vite SPA) and `server/` (Laravel 12 API). Also see `CLAUDE.md` for complementary guidance.

## Commands

### Backend (`server/`)

| Action | Command |
|---|---|
| Full dev stack (serve + queue + logs + Vite) | `composer run dev` |
| API only | `php artisan serve` |
| Queue worker (required for email notifications) | `php artisan queue:listen --tries=1` |
| Tests (Pest) | `php artisan test` |
| Format | `./vendor/bin/pint` |

- `phpunit.xml` sets `QUEUE_CONNECTION=sync` for tests — no queue worker needed.
- Reminder command: `php artisan notifications:reminder`. No in-repo scheduler — wire externally via cron / Task Scheduler.

### Frontend (`client/`)

| Action | Command |
|---|---|
| Dev server | `pnpm dev` |
| Lint (ESLint flat config, JSX) | `pnpm lint` |
| Build production | `pnpm build` |

- No TypeScript, no typecheck step.
- Lint ignores `src/components/ui/**` (shadcn generated code), `dist/`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`.
- Production build copies `public/.htaccess` into `dist/`.
- Path alias: `@` → `./src` (configured in `vite.config.js` and `jsconfig.json`).

## Architecture

### API contracts

- All responses: `{ code, message, data }` — via `ApiResponse` trait (`server/app/Traits/ApiResponse.php`).
- Auth endpoints (`auth/login`, `auth/register`) throttle-limited to 10 req/min.
- Email resend throttled to 6 req/min.
- Register endpoint expects `multipart/form-data`.
- GPA calculation is GET `/assessments/calculate` (no POST — read-then-compute).
- Task status update uses PATCH `tasks/{id}/status` (separate from full update).
- Most protected routes require both `auth:sanctum` AND `verified` middleware.

### Auth flow

- Token stored in `localStorage` key `token`. Email verification flag keyed `isEmailVerified`.
- `axiosInstance` interceptor attaches `Bearer` token on requests, clears storage + redirects to `/auth/login` on 401.
- `ProtectedRoute` checks both token presence and `isEmailVerified !== 'false'`.

### Data flow (frontend)

`pages/` → thin wrappers → `components/*/*View.jsx` → `hooks/*.js` → `api/*.js` → `axiosInstance`.

- Hooks manage fetch/mutate flows and UI loading state. No React Query / TanStack Query.
- Global state: Zustand persists semester filter to `localStorage` key `semester-storage`.

### Notifications

- Queueable via `ShouldQueue`. Reminder command checks per-user `settings.deadline_notification` (days offset), `settings.notification_channel` (email/telegram/both).
- Telegram messages use MarkdownV2 formatting.
- Events are NOT used — services call notifications directly.

## Scaffolding gaps

These directories exist but are empty (not yet wired):
- `server/app/Http/Requests/Auth/`, `CourseContent/`, `Task/` — no form request classes (validation in controllers).
- `server/app/Exports/`, `Helpers/`, `Resources/`

## Frontend test gap

`client/test/` exists but is empty. No test runner configured on the frontend.
