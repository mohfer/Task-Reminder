# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project layout

- `server/`: Laravel 12 API backend (Sanctum auth, email verification, notifications, queue worker, Pest tests).
- `client/`: React 18 + Vite SPA (Tailwind + Radix/shadcn-style UI, Zustand state).

## Common commands

### Backend (`server/`)

- Install dependencies:
  - `composer install`
  - `npm install`

- Initial setup:
  - `cp .env.example .env`
  - `php artisan key:generate`
  - `php artisan migrate`

- Run full local backend stack (API server + queue worker + logs + Vite):
  - `composer run dev`

- Run only API server:
  - `php artisan serve`

- Run queue worker (needed for queued email notifications):
  - `php artisan queue:listen --tries=1`

- Run tests:
  - `php artisan test`

- Run a single test file:
  - `php artisan test tests/Feature/ExampleTest.php`

- Run a single test by name:
  - `php artisan test --filter="ExampleTest"`

- Format PHP code:
  - `./vendor/bin/pint`

### Frontend (`client/`)

`client/pnpm-lock.yaml` is present, so use pnpm.

- Install dependencies:
  - `pnpm install`

- Start dev server:
  - `pnpm dev`

- Build production bundle:
  - `pnpm build`

- Lint:
  - `pnpm lint`

- Preview production build:
  - `pnpm preview`

## Architecture overview

### Backend architecture (Laravel API)

- API routes are defined in `server/routes/api.php`.
  - Public: login/register and password reset endpoints.
  - Protected: `auth:sanctum` routes, with most app routes additionally requiring `verified` email.

- Controllers in `server/app/Http/Controllers` are thin and delegate business logic to `server/app/Services`.
- API responses are normalized through `server/app/Traits/ApiResponse.php` with payload shape:
  - `{ code, message, data }`

- Core model relationships:
  - `User` has many `CourseContent`, `Task`, `Grade`, and settings.
  - `Task` belongs to `CourseContent` and exposes computed `deadline_label` (due today / days left / overdue / completed).

- Business logic lives in services:
  - `DashboardService`: dashboard task aggregates, chart data, semester overview.
  - `AssessmentService`: per-semester and cumulative GPA calculation + score updates.
  - `TaskService`, `CourseContentService`, `SettingsService`, `AuthService`: CRUD + auth + notification toggles.

- Email notifications are queueable (`ShouldQueue`) and implemented in `server/app/Notifications`.
- Reminder batch command exists at:
  - `server/app/Console/Commands/SendReminderEmailNotifications.php`
  - Signature: `php artisan notifications:reminder`
  - Note: command exists, but no in-repo scheduler wiring was found; schedule externally or run manually.

### Frontend architecture (React SPA)

- App entry: `client/src/main.jsx` (BrowserRouter + ThemeProvider + Sonner toaster).
- Route map: `client/src/App.jsx` with lazy-loaded pages and `ProtectedRoute`.
- Auth guard: `client/src/components/ProtectedRoute/ProtectedRoute.jsx` checks `localStorage` token and `isEmailVerified`.
- Network layer: `client/src/api/*.js` over shared `client/src/api/axiosInstance.js`:
  - Base URL from `VITE_API_URL`
  - Adds `Authorization: Bearer <token>` from localStorage
  - On 401, clears storage and redirects to `/auth/login`

- Data orchestration pattern:
  - Hooks in `client/src/hooks` manage fetch/mutate flows and UI loading state.
  - API modules in `client/src/api` map directly to backend endpoint groups.
  - Page files in `client/src/pages` are thin wrappers around feature views in `client/src/components/*/*View.jsx`.

- Shared shell/layout is in `client/src/components/layout/AppLayout.jsx`.
- Global lightweight state is in Zustand store `client/src/store/useSemesterStore.js`.
- Vite config (`client/vite.config.js`) defines `@ -> ./src` alias.

## Environment coupling

- Frontend API base URL is configured via `client/.env` / `client/.env.example`:
  - `VITE_API_URL=${VITE_BASE_URL}/api`

- Backend email templates use `config('app.frontend_url')` for dashboard links:
  - set `FRONTEND_URL` in `server/.env` when changing frontend host/port.
