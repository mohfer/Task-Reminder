<p align="center">
  <img src="./screen/preview.png" alt="Preview" width="600" />
</p>

<h1 align="center">Task Reminder</h1>

<p align="center">
  <img src="https://img.shields.io/badge/PHP-^8.3-777BB4?style=flat&logo=php" alt="PHP">
  <img src="https://img.shields.io/badge/Laravel-13.30-F9322C?style=flat&logo=laravel" alt="Laravel">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-8.2-B73BFE?style=flat&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-4.3-06B6D4?style=flat&logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/license-MIT-yellow?style=flat" alt="License">
</p>

<p align="center">A college assignment reminder app with task, GPA, and schedule tracking, Siakang sync, and notifications.</p>

## Features

- Task management with priority flags and due-date tracking
- Course content CRUD with Excel import and template download
- Weekly schedule with overlap detection and multi-week navigation
- Monthly task calendar with status badges and overdue highlighting
- Dashboard analytics with bar chart and semester overview
- Assessment and GPA tracking per semester and cumulative
- Custom grade scale management
- Siakang sync for grades and schedules via siakang-scrapling
- Notification channels: email, telegram, or both with test button
- Queued email delivery and Telegram MarkdownV2 formatting
- User settings for profile, password, and notification preferences
- Theme support: light, dark, and system
- Responsive design for mobile, tablet, and desktop
- Sanctum SPA auth with email verification and password reset

## Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind 4, shadcn/ui, React Router 7, Zustand, Chart.js
- **Backend**: Laravel 13 (PHP 8.3), Sanctum, Octane, Excel 4.0, Pest 5
- **Bridge**: Python 3.11 + `uv` + `siakang-scrapling`

## Setup

**Prerequisites:** PHP 8.3+, Composer, Node 20+, pnpm 11+, Python 3.11 + uv, MySQL

```bash
# Backend
cd server
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
cd siakang-sync && uv sync && cd ..

# Frontend
cd client
pnpm install
```

**Key env:** `DB_DATABASE`, `QUEUE_CONNECTION=database`, `FRONTEND_URL`, `TELEGRAM_BOT_TOKEN` (see `.env.example`)

## Run Dev

```bash
# Terminal 1 — API :8000 + queue + logs
cd server && composer run dev

# Terminal 2 — SPA :5173
cd client && pnpm dev
```

## Commands

```bash
cd server && php artisan test                    # 218 tests (Feature + Unit)
cd server && php artisan test --testsuite=Feature
cd server && php artisan test --testsuite=Unit
cd server && php artisan queue:listen --tries=1
cd server && php artisan notifications:reminder
cd server && ./vendor/bin/pint
cd client && pnpm lint && pnpm build
cd client && pnpm test                           # 97 tests Vitest + jsdom + Testing Library
```

## Siakang Sync

1. Settings → Siakang → enter Siakang email and password (encrypted, validated first)
2. Open Assessments or Course Contents → Sync from Siakang → pick a Siakang semester
3. Data is imported into the semester currently viewed in the app
