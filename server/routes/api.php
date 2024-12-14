<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CourseContentController;
use App\Http\Controllers\PasswordResetController;

Route::prefix('auth')->group(function () {
    // Auth
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
});

// Password Reset
Route::post('/password/email', [PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword'])->name('password.reset');

// Verify Email
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail'])->middleware(['throttle:6,1'])->name('verification.send');;
    Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->middleware(['signed'])->name('verification.verify');
    Route::get('/auth/check/token', [AuthController::class, 'checkToken']);
    Route::get('/auth/check/email', [AuthController::class, 'checkEmail']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    // User
    Route::get('/auth/user', [UserController::class, 'getAuthenticatedUser']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::post('/dashboard/filter', [DashboardController::class, 'filter']);

    // Course Content
    Route::resource('course-contents', CourseContentController::class);
    Route::post('/course-contents/filter', [CourseContentController::class, 'filter']);

    // Task
    Route::resource('tasks', TaskController::class);
    Route::patch('/tasks/{id}/status', [TaskController::class, 'statusChanged']);

    // Settings
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::put('/settings/deadline-notification', [SettingsController::class, 'deadlineNotification']);
    Route::patch('/settings/task-created-notification', [SettingsController::class, 'taskCreatedNotification']);
    Route::patch('/settings/task-completed-notification', [SettingsController::class, 'taskCompletedNotification']);
    Route::put('/settings/profile', [UserController::class, 'updateProfile']);
    Route::put('/settings/password', [UserController::class, 'changePassword']);

    // Logout
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});
