<p align="center">
  <img src="./screen/logo.png" alt="Logo" width="150">
</p>

# Task Reminder

Task Reminder is a college assignment reminder application designed to help students manage and prioritize their tasks. This app offers automatic reminders, task scheduling, and a user-friendly interface to ensure all assignments are completed on time.

## Features

- **Automatic Reminders**: Sends deadline reminder emails based on user-defined intervals.
- **Task Management**: Create, update, delete, and complete tasks with priority and due-date tracking.
- **Course Content Management**: Manage semester course data and import it from Excel.
- **Weekly Schedule**: Displays a weekly timetable with overlap detection.
- **Task Calendar**: Shows tasks on a monthly calendar with status badges.
- **Bar Chart Analytics**: Visualizes task distribution by course content.
- **Semester Overview**: Tracks semester and cumulative GPA trends.
- **Grading System**: Supports customizable grading scales and automatic GPA calculation.
- **Assessment Scores**: Records course scores with automatic grade mapping.
- **Email Notifications**: Uses consistent templates for key account and task events.
- **User Settings**: Manage notification preferences, profile, and password.
- **Dark Mode & Light Mode**: Supports theme switching with consistent UI styling.
- **PWA Support**: Installable app with offline capability via service worker.
- **Responsive Design**: Optimized for mobile, tablet, and desktop.
- **Authentication**: Secure auth flow with email verification and password reset.
- **Excel Import**: Imports course contents with validation and duplicate checks.

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
