<?php

use App\Http\Controllers\Api\CourseContentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/course-contents/email', [CourseContentController::class, 'email']);
Route::apiResource('/course-contents', CourseContentController::class);
