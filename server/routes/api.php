<?php

use App\Http\Controllers\CourseContentController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Route::get('/course-contents/email', [CourseContentController::class, 'email']);
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);


Route::get('/course-contents', [CourseContentController::class, 'index']);
Route::post('/course-contents', [CourseContentController::class, 'store']);
Route::get('/course-contents/{id}', [CourseContentController::class, 'show']);
Route::put('/course-contents/{id}', [CourseContentController::class, 'update']);
Route::delete('/course-contents/{id}', [CourseContentController::class, 'destroy']);
