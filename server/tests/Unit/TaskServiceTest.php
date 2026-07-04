<?php

use App\Models\CourseContent;
use App\Models\Task;
use App\Models\User;
use App\Services\TaskService;
use App\Services\TelegramService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(Tests\TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    // Mock telegram service so no real HTTP calls happen
    $this->telegramService = Mockery::mock(TelegramService::class);
    $this->telegramService->shouldReceive('sendTaskCreated')->byDefault();
    $this->telegramService->shouldReceive('sendTaskCompleted')->byDefault();
    $this->service = new TaskService($this->telegramService);
    $this->user = User::factory()->create();
});

// ─── create ───

test('create makes a new task belonging to user and course content', function () {
    Notification::fake();

    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $this->user->id,
    ]);

    $data = [
        'task' => 'Kerjakan PR',
        'description' => 'Bab 1-3',
        'deadline' => '2025-06-15',
        'priority' => true,
        'course_content_id' => $course->id,
    ];

    $task = $this->service->create($this->user, $data);

    expect($task->task)->toBe('Kerjakan PR');
    expect($task->description)->toBe('Bab 1-3');
    expect($task->status)->toBe(0);
    expect($task->priority)->toBe(1);
    expect($task->course_content_id)->toBe($course->id);
    expect($task->user_id)->toBe($this->user->id);
});

test('create throws when course_content does not belong to user', function () {
    $otherUser = User::factory()->create();
    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $otherUser->id,
    ]);

    $this->service->create($this->user, [
        'task' => 'Test', 'deadline' => '2025-06-15', 'course_content_id' => $course->id,
    ]);
})->throws(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

test('create defaults priority to 0 when not provided', function () {
    Notification::fake();

    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $this->user->id,
    ]);

    $task = $this->service->create($this->user, [
        'task' => 'No priority', 'deadline' => '2025-06-15', 'course_content_id' => $course->id,
    ]);

    expect($task->priority)->toBe(0);
});

// ─── update ───

test('update modifies task fields', function () {
    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $this->user->id,
    ]);

    $task = Task::create([
        'task' => 'Old', 'deadline' => '2025-01-01', 'status' => 0, 'course_content_id' => $course->id, 'user_id' => $this->user->id,
    ]);

    $updated = $this->service->update($this->user->id, $task->id, [
        'task' => 'Updated', 'deadline' => '2025-12-31', 'course_content_id' => $course->id,
    ]);

    expect($updated->task)->toBe('Updated');
});

test('update throws for another user task', function () {
    $otherUser = User::factory()->create();
    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $otherUser->id,
    ]);

    $task = Task::create([
        'task' => 'Other', 'deadline' => '2025-01-01', 'status' => 0, 'course_content_id' => $course->id, 'user_id' => $otherUser->id,
    ]);

    $this->service->update($this->user->id, $task->id, [
        'task' => 'Hijack', 'deadline' => '2025-12-31', 'course_content_id' => $course->id,
    ]);
})->throws(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

// ─── delete ───

test('delete removes task owned by user', function () {
    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $this->user->id,
    ]);

    $task = Task::create([
        'task' => 'Delete me', 'deadline' => '2025-01-01', 'status' => 0, 'course_content_id' => $course->id, 'user_id' => $this->user->id,
    ]);

    $this->service->delete($this->user->id, $task->id);

    expect(Task::find($task->id))->toBeNull();
});

test('delete throws for another user task', function () {
    $otherUser = User::factory()->create();
    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $otherUser->id,
    ]);

    $task = Task::create([
        'task' => 'Other', 'deadline' => '2025-01-01', 'status' => 0, 'course_content_id' => $course->id, 'user_id' => $otherUser->id,
    ]);

    $this->service->delete($this->user->id, $task->id);
})->throws(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

// ─── toggleStatus ───

test('toggleStatus flips task status from 0 to 1', function () {
    Notification::fake();

    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $this->user->id,
    ]);

    $task = Task::create([
        'task' => 'Toggle', 'deadline' => '2025-01-01', 'status' => 0, 'course_content_id' => $course->id, 'user_id' => $this->user->id,
    ]);

    $result = $this->service->toggleStatus($this->user, $task->id);

    expect($result->status)->toBe(1);
});

test('toggleStatus flips from 1 back to 0', function () {
    Notification::fake();

    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $this->user->id,
    ]);

    $task = Task::create([
        'task' => 'Toggle', 'deadline' => '2025-01-01', 'course_content_id' => $course->id,
        'user_id' => $this->user->id, 'status' => 1,
    ]);

    $result = $this->service->toggleStatus($this->user, $task->id);

    expect($result->status)->toBe(0);
});

test('toggleStatus throws for another user task', function () {
    $otherUser = User::factory()->create();
    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $otherUser->id,
    ]);

    $task = Task::create([
        'task' => 'Other', 'deadline' => '2025-01-01', 'status' => 0, 'course_content_id' => $course->id, 'user_id' => $otherUser->id,
    ]);

    $this->service->toggleStatus($this->user, $task->id);
})->throws(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
