## Project

Monorepo with two separate dev servers:

- `client/` — React 18 + Vite SPA (pnpm)
- `server/` — Laravel 12 API + Octane (FrankenPHP) + Pest tests

## Commands

```bash
# Both must run concurrently for full-stack dev
cd server && composer run dev    # API :8000 + queue + pail logs + Laravel Vite
cd client && pnpm dev            # React SPA :5173
```

```bash
# Single test / test suite
cd server
php artisan test --filter=MyTest
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit

# Lint (client only)
cd client && pnpm lint

# Format (server)
cd server && ./vendor/bin/pint

# Manual reminder trigger (bypasses schedule)
cd server && php artisan notifications:reminder

# Queue worker only
cd server && php artisan queue:listen --tries=1
```

## Architecture

- **Controller → Service**: Controllers in `app/Http/Controllers/` delegate to services in `app/Services/`. All controllers use the `ApiResponse` trait for JSON responses.
- **Sanctum SPA auth**: Most API routes require `auth:sanctum` + `verified` middleware (`server/routes/api.php:32`). Auth routes are rate-limited (`throttle:10,1`).
- **Queue**: Database driver. Email notifications use `ShouldQueue`. Must run a queue worker for email delivery.
- **Notifications**: `notifications:reminder` sends both email (queued) and Telegram (synchronous via Bot API, MarkdownV2) per user settings. Test notification button hits the same services via `SettingsController::testNotification`.

## Testing (Pest)

```bash
cd server && php artisan test
```

- Framework is **Pest** (not bare PHPUnit).
- All `Feature` tests automatically use `RefreshDatabase` trait (`server/tests/Pest.php:14`).
- Testing DB connection is `mysql` → database `task_reminder_test` (`server/phpunit.xml:27`). A MySQL server with that database must exist before running tests.
- Test env sets `QUEUE_CONNECTION=sync` and `MAIL_MAILER=array`.
- Feature tests match API route groups: Auth, Task, CourseContent, Assessment, Dashboard, Grade, Settings, PasswordReset, User.
- Unit tests match service classes one-to-one.

## Client conventions

- **Package manager**: pnpm (not npm/yarn).
- **shadcn/ui**: New York style, JSX (no TypeScript), Lucide icons. UI components in `src/components/ui/` are ESLint-ignored auto-generated code.
- **State**: Zustand store `useSemesterStore` for semester ID persistence across pages.
- **API**: Axios instance in `src/api/axiosInstance.js` — reads `VITE_API_URL` from env.
- **Routing**: React Router with code-split lazy pages. All protected pages wrap in `<ProtectedRoute>`.
- **Alias**: `@/` → `src/` (vite + jsconfig).

## Env vars

**Client** (`client/.env`):
- `VITE_BASE_URL` — backend origin (default `http://localhost:8000`)
- `VITE_API_URL` — computed as `${VITE_BASE_URL}/api`

**Server** (`server/.env`):
- `DB_DATABASE` — MySQL database name
- `QUEUE_CONNECTION=database`
- `FRONTEND_URL` — CORS/origin for Sanctum (default `http://localhost:5173`)
- `TELEGRAM_BOT_TOKEN` — required for Telegram notifications
- `SIAKANG_UV` — optional absolute path to `uv` for the bridge; set on servers where Octane/FrankenPHP has a restricted PATH (defaults to `/root/.local/bin/uv`)

## Siakang sync (Python bridge)

Laravel shells out to a small Python CLI at `server/siakang-sync/run.py` to pull grades/schedule from Siakang via the `siakang-scrapling` library. Communication is JSON over stdin/stdout.

- **Bridge**: `server/siakang-sync/run.py` — reads a JSON command from stdin, writes `{code, message, data}` to stdout. Always exits `0` for valid commands (HTTP-like status rides in `code`); non-zero only for hard process failures.
- **Invoker**: `app/Services/SiakangClient.php` — `Process` facade, sends payload via `->input()`. Prefers `.venv/bin/python` (no runtime `uv` dependency), falls back to `uv run`.
- **Setup**: `cd server/siakang-sync && uv sync` (Python 3.11+). `.venv`, `uv.lock`, and `.siakang_session_*.json` are gitignored.
- **Session cache**: `session_file=True` everywhere except `verify`, which forces a fresh login so a wrong password isn't masked by a cached session.
- **Details**: the schedule bridge uses `get_detail(schedule_id, tab_keys=[])` (header-only) fetched in parallel — only `kelas` + `dosen` are needed, not all tabs.
- **Credentials**: stored encrypted in `settings.siakang_email`/`settings.siakang_password` (`encrypted` cast, hidden from JSON). `SettingsService::updateSiakangCredentials` validates via Siakang before persisting; a 401 here must NOT be treated as an app-logout.

## graphify

This project has a knowledge graph at `graphify-out/` with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when `graphify-out/graph.json` exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty `graphify-out/` files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
