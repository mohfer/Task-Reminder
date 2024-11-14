<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseContentController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('register', [AuthController::class, 'register'])->name('auth.register');
});

// Route::get('/email/verify', [AuthController::class, 'verify'])->middleware('auth')->name('verification.notice');

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/auth/user', [UserController::class, 'getAuthenticatedUser'])->name('auth.user');
    Route::resource('course-contents', CourseContentController::class);
    Route::resource('tasks', TaskController::class);
    Route::patch('/tasks/{id}/status', [TaskController::class, 'statusChanged'])->name('tasks.statusChanged');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
});
