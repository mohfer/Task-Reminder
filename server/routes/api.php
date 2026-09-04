<?php

use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseContentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
});

// Password Reset
Route::post('/password/email', [PasswordResetController::class, 'sendResetLink'])->middleware('throttle:5,1');
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword'])->middleware('throttle:5,1')->name('password.reset');

// Verify Email
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail'])->middleware(['throttle:6,1'])->name('verification.send');
    Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->middleware(['signed'])->name('verification.verify');
    Route::get('/auth/check/token', [AuthController::class, 'checkToken']);
    Route::get('/auth/check/email', [AuthController::class, 'checkEmail']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    // User
    Route::get('/auth/user', [UserController::class, 'getAuthenticatedUser']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/chart', [DashboardController::class, 'chart']);
    Route::get('/dashboard/semester-overview', [DashboardController::class, 'semesterOverview']);

    // Course Content — custom routes harus sebelum apiResource agar tidak tertabrak {course_content}
    Route::get('/course-contents/filter', [CourseContentController::class, 'filter']);
    Route::get('/course-contents/download-template', [CourseContentController::class, 'downloadTemplate']);
    Route::post('/course-contents/import-from-excel', [CourseContentController::class, 'importFromExcel']);
    Route::post('/course-contents/sync-schedule', [CourseContentController::class, 'syncSchedule']);
    Route::apiResource('course-contents', CourseContentController::class)->only(['store', 'update', 'destroy']);

    // Assessment — calculate/sync/semesters custom, update via resource-style
    Route::get('/assessments/calculate', [AssessmentController::class, 'calculateGpa']);
    Route::get('/assessments/semesters', [AssessmentController::class, 'semesters']);
    Route::post('/assessments/sync', [AssessmentController::class, 'sync']);
    Route::patch('/assessments/{id}', [AssessmentController::class, 'update']);

    // Task — apiResource untuk CRUD standar, status toggle custom
    Route::apiResource('tasks', TaskController::class)->only(['store', 'update', 'destroy']);
    Route::patch('/tasks/{id}/status', [TaskController::class, 'statusChanged']);

    // Settings
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::put('/settings/deadline-notification', [SettingsController::class, 'deadlineNotification']);
    Route::put('/settings/notification-channel', [SettingsController::class, 'notificationChannel']);
    Route::put('/settings/telegram-chat-id', [SettingsController::class, 'telegramChatId']);
    Route::post('/settings/test-notification', [SettingsController::class, 'testNotification']);
    Route::patch('/settings/task-created-notification', [SettingsController::class, 'taskCreatedNotification']);
    Route::patch('/settings/task-completed-notification', [SettingsController::class, 'taskCompletedNotification']);
    Route::put('/settings/siakang-credentials', [SettingsController::class, 'siakangCredentials']);
    Route::delete('/settings/siakang-credentials', [SettingsController::class, 'siakangCredentialsDelete']);
    Route::put('/settings/profile', [UserController::class, 'updateProfile']);
    Route::put('/settings/password', [UserController::class, 'changePassword']);
    Route::apiResource('settings/grades', GradeController::class)->only(['index', 'store', 'update', 'destroy']);

    // Logout
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});
