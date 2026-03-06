<p align="center">
  <img src="./screen/logo.png" alt="Logo" width="150">
</p>

# Task Reminder

Task Reminder is a college assignment reminder application designed to help students manage and prioritize their tasks. This app offers automatic reminders, task scheduling, and a user-friendly interface to ensure all assignments are completed on time.

## Features

- **Automatic Reminders**: Sends email notifications for upcoming deadlines based on configurable intervals (e.g., 5 days before, 1 day before, due today, priority tasks).
- **Task Management**: Create, update, delete, and mark tasks as completed with deadline tracking and priority flags.
- **Course Content Management**: Manage course data per semester including code, lecturer, credits, schedule, with Excel import support.
- **Weekly Schedule**: Visual weekly schedule grid showing course timetable with overlap detection and day indicator for current day.
- **Task Calendar**: Interactive monthly calendar view showing tasks on their deadline dates with color-coded status badges.
- **Bar Chart Analytics**: Visual bar chart showing task distribution per course content with drill-down to individual tasks.
- **Semester Overview**: Cumulative and per-semester GPA trends with task distribution line charts across all semesters.
- **Grading System**: Customizable grading scale with automatic GPA calculation (semester and cumulative) based on course scores.
- **Assessment Scores**: Record and update scores for each course content with automatic grade mapping and GPA computation.
- **Email Notifications**: Consistent custom-designed email templates for task creation, task completion, deadline reminders, password reset, and email verification.
- **User Settings**: Configurable notification preferences (deadline reminder interval, task created/completed toggles), profile editing, and password management.
- **Dark Mode & Light Mode**: Full theme support with system preference detection and consistent scrollbar styling.
- **PWA Support**: Progressive Web App with service worker, offline capability, and installable on mobile devices.
- **Responsive Design**: Optimized for mobile, tablet, and desktop with horizontal scrolling tabs and touch-friendly interface.
- **Authentication**: Secure login/register with email verification, token-based authentication (Sanctum), and password reset flow.
- **Excel Import**: Bulk import course contents from Excel files with validation, duplicate detection, and error reporting.

## Tech Stack

### Frontend

- React 18+ with Vite
- Tailwind CSS
- shadcn/ui components (Radix UI)
- Chart.js (Bar & Line charts)
- Zustand (State management)
- date-fns (Date utilities)
- PWA (Vite PWA plugin)

### Backend

- Laravel 11+ (PHP 8.3+)
- Laravel Sanctum (API authentication)
- Maatwebsite Excel (Excel import/export)
- Queue system for email notifications

## Screenshots

### Login

![Task Reminder Login Screenshot](./screen/login.png)

### Dashboard

![Task Reminder Dashboard Screenshot](./screen/dashboard.png)

### Bar Chart

![Task Reminder Bar Chart Screenshot](./screen/bar-chart.png)

### Course Contents

![Task Reminder Course Contents Screenshot](./screen/course-contents.png)

### Assessments

![Task Reminder Assessments Screenshot](./screen/assessments.png)

### Settings

![Task Reminder Settings Screenshot](./screen/settings.png)

### Grades

![Task Reminder Grades Screenshot](./screen/grades.png)
