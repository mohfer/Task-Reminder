<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseContentController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    // Auth
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
});

// Route::get('/email/verify', [AuthController::class, 'verify'])->middleware('auth')->name('verification.notice');

Route::middleware(['auth:sanctum'])->group(function () {
    // User
    Route::get('/auth/user', [UserController::class, 'getAuthenticatedUser']);

    // Course Content
    Route::resource('course-contents', CourseContentController::class);

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

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
});
