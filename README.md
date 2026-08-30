<p align="center">
  <img src="./screen/preview.png" alt="Preview" width="600" />
</p>

<h1 align="center">Task Reminder</h1>

<p align="center">
  <img src="https://img.shields.io/badge/PHP-^8.2-777BB4?style=flat&logo=php" alt="PHP">
  <img src="https://img.shields.io/badge/Laravel-^12.0-F9322C?style=flat&logo=laravel" alt="Laravel">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-6-B73BFE?style=flat&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat&logo=tailwindcss" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat" alt="License">
</p>

<p align="center">
  A college assignment reminder app with task tracking, GPA tracking, schedule management, Siakang sync, and configurable notifications.
</p>

## Features

- **Task Management**: Create, update, delete, and complete tasks with due-date tracking and priority flags.
- **Course Content Management**: Manage semester course data and import it from Excel.
- **Weekly Schedule Page**: Dedicated schedule page with overlap detection and multi-week navigation.
- **Task Calendar**: Monthly calendar with task status badges and overdue highlighting.
- **Dashboard Analytics**: Bar chart and semester overview for academic progress.
- **Assessment & GPA Tracking**: Record scores and calculate semester/cumulative GPA.
- **Siakang Sync**: Pull grades and weekly schedules directly from Siakang Untirta via the `siakang-scrapling` library.
- **Custom Grade Scale**: Manage your own grade ranges and points.
- **Notification Channels**: Choose `email`, `telegram`, or `both` from settings.
- **Telegram Integration**: Telegram Bot API notifications with MarkdownV2 formatting.
- **Test Notification Button**: Send dummy notification before enabling live flow.
- **Email Templates**: Consistent Blade templates for account and task emails.
- **Queued Email Delivery**: Email notifications are delivered through Laravel queue.
- **User Settings**: Manage profile, password, and notification preferences.
- **Theme Support**: Light, dark, and system theme cycle.
- **Responsive Design**: Optimized for mobile, tablet, and desktop.
- **Authentication**: Secure auth flow with email verification and password reset.

## Tech Stack

### Frontend

- React 18+ with Vite (SPA)
- Tailwind CSS
- shadcn/ui components (New York style, JSX)
- Chart.js (Bar & Line charts)
- Zustand (State management)
- date-fns (Date utilities)
- Lucide (Icons)

### Backend

- Laravel 12+ (PHP 8.2+)
- Laravel Sanctum (SPA API authentication)
- Laravel Octane (FrankenPHP server)
- Maatwebsite Excel (Excel import/export)
- Database queue driver for email notifications
- Telegram Bot API
- Pest testing framework
- Python bridge (`siakang-sync`) using [siakang-scrapling](https://github.com/mohfer/siakang-scrapling) via `uv`

## Setup

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- pnpm
- Python 3.11+ and [uv](https://docs.astral.sh/uv/) (for the Siakang sync bridge)
- MySQL (or compatible database)

### Backend (`server/`)

```bash
cd server
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate

# Python bridge for Siakang sync (requires Python 3.11+ and uv)
cd siakang-sync
uv sync
```

### Frontend (`client/`)

```bash
cd client
pnpm install
```

### Environment Variables

| Variable | Description |
|---|---|
| `DB_DATABASE` | MySQL database name |
| `QUEUE_CONNECTION` | Queue driver (set to `database`) |
| `FRONTEND_URL` | CORS/origin for Sanctum (default `http://localhost:5173`) |
| `TELEGRAM_BOT_TOKEN` | Required for Telegram notifications |
| `SIAKANG_UV` | Optional absolute path to the `uv` binary for the Siakang sync bridge (set on servers with a restricted runtime PATH; defaults to `/root/.local/bin/uv`) |

### Run Development Servers

Both must run concurrently:

```bash
# Terminal 1 — Backend API (:8000) + queue + logs
cd server
composer run dev

# Terminal 2 — Frontend SPA (:5173)
cd client
pnpm dev
```

### Useful Commands

```bash
# Run queue worker only
cd server && php artisan queue:listen --tries=1

# Trigger reminder notifications manually
cd server && php artisan notifications:reminder

# Run tests (Pest)
cd server && php artisan test

# Run a single test suite
cd server && php artisan test --testsuite=Feature

# Lint client
cd client && pnpm lint
```

## Architecture

- **Controller → Service**: Controllers delegate to services. All controllers use `ApiResponse` trait for JSON.
- **Sanctum SPA auth**: Most API routes require `auth:sanctum` + `verified` middleware.
- **Queue**: Database driver. Email notifications use `ShouldQueue`.
- **Notifications**: `notifications:reminder` sends both email (queued) and Telegram (synchronous) per user settings.
- **Siakang Sync**: Laravel shells out to a small Python bridge (`server/siakang-sync`) that uses the `siakang-scrapling` library over stdin/stdout JSON.

## Siakang Sync

The app pulls grades and weekly schedules straight from [Siakang Untirta](https://siakang.untirta.ac.id) via the [siakang-scrapling](https://github.com/mohfer/siakang-scrapling) Python library.

1. In **Settings → Siakang**, enter your Siakang email and password (stored encrypted). The credentials are validated against Siakang before being saved. This is separate from your Task Reminder login.
2. Open **Assessments** (grades) or **Course Contents** (schedule) → click **Sync from Siakang** (visible only when credentials are connected).
3. Pick the Siakang semester to pull from. Data is saved into the semester you are currently viewing in the app.

Credentials are encrypted at rest via Laravel's `encrypted` cast. The Python bridge reads them from stdin and never logs them. Siakang session cookies are gitignored.

## Notification Notes

- **Email** notifications (including test email) use Laravel notifications with `ShouldQueue`.
- **Telegram** notifications are sent via Bot API in `MarkdownV2` mode.
- To send Telegram messages, set `TELEGRAM_BOT_TOKEN` and save user `telegram_chat_id` in settings.