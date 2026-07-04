<?php

use App\Models\CourseContent;
use App\Models\Task;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    Sanctum::actingAs($this->user, ['*']);

    $this->course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $this->user->id,
    ]);
});

// ─── POST /api/tasks ───

test('create task returns 201 with valid data', function () {
    $response = $this->postJson('/api/tasks', [
        'task' => 'Kerjakan PR',
        'description' => 'Bab 1-3',
        'deadline' => '2025-06-15',
        'priority' => true,
        'course_content_id' => $this->course->id,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('code', 201)
        ->assertJsonPath('data.task', 'Kerjakan PR');
});

test('create task rejects missing task field', function () {
    $response = $this->postJson('/api/tasks', [
        'deadline' => '2025-06-15',
        'course_content_id' => $this->course->id,
    ]);

    $response->assertStatus(422);
});

test('create task rejects non-existent course_content_id', function () {
    $response = $this->postJson('/api/tasks', [
        'task' => 'Test',
        'deadline' => '2025-06-15',
        'course_content_id' => 99999,
    ]);

    $response->assertStatus(422);
});

// ─── PUT /api/tasks/{id} ───

test('update task modifies existing task', function () {
    $task = Task::create([
        'task' => 'Old', 'deadline' => '2025-01-01', 'status' => 0, 'course_content_id' => $this->course->id,
        'user_id' => $this->user->id,
    ]);

    $response = $this->putJson("/api/tasks/{$task->id}", [
        'task' => 'Updated',
        'deadline' => '2025-12-31',
        'course_content_id' => $this->course->id,
    ]);

    $response->assertOk()
        ->assertJsonPath('data.task', 'Updated');
});

test('update task returns 404 for another user task', function () {
    $otherUser = User::factory()->create();
    $task = Task::create([
        'task' => 'Other', 'deadline' => '2025-01-01', 'status' => 0, 'course_content_id' => $this->course->id,
        'user_id' => $otherUser->id,
    ]);

    $response = $this->putJson("/api/tasks/{$task->id}", [
        'task' => 'Hijack',
        'deadline' => '2025-12-31',
        'course_content_id' => $this->course->id,
    ]);

    $response->assertStatus(404);
});

// ─── DELETE /api/tasks/{id} ───

test('delete task removes it', function () {
    $task = Task::create([
        'task' => 'Delete me', 'deadline' => '2025-01-01', 'status' => 0, 'course_content_id' => $this->course->id,
        'user_id' => $this->user->id,
    ]);

    $response = $this->deleteJson("/api/tasks/{$task->id}");

    $response->assertOk();
    expect(Task::find($task->id))->toBeNull();
});

test('delete task returns 404 for another user task', function () {
    $otherUser = User::factory()->create();
    $task = Task::create([
        'task' => 'Other', 'deadline' => '2025-01-01', 'status' => 0, 'course_content_id' => $this->course->id,
        'user_id' => $otherUser->id,
    ]);

    $response = $this->deleteJson("/api/tasks/{$task->id}");

    $response->assertStatus(404);
});

// ─── PATCH /api/tasks/{id}/status ───

test('toggle status flips task status', function () {
    $task = Task::create([
        'task' => 'Toggle', 'deadline' => '2025-01-01', 'course_content_id' => $this->course->id,
        'user_id' => $this->user->id, 'status' => 0,
    ]);

    $response = $this->patchJson("/api/tasks/{$task->id}/status");

    $response->assertOk()
        ->assertJsonPath('data.status', 1);
});

test('toggle status returns 404 for another user task', function () {
    $otherUser = User::factory()->create();
    $task = Task::create([
        'task' => 'Other', 'deadline' => '2025-01-01', 'status' => 0, 'course_content_id' => $this->course->id,
        'user_id' => $otherUser->id,
    ]);

    $response = $this->patchJson("/api/tasks/{$task->id}/status");

    $response->assertStatus(404);
});
