<?php

use App\Models\CourseContent;
use App\Models\Task;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    Sanctum::actingAs($this->user, ['*']);
});

// ─── GET /api/dashboard ───

test('dashboard returns task counts and tasks', function () {
    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $this->user->id,
    ]);

    Task::create([
        'task' => 'PR 1', 'deadline' => '2025-12-31', 'course_content_id' => $course->id,
        'user_id' => $this->user->id, 'status' => 0,
    ]);
    Task::create([
        'task' => 'PR 2', 'deadline' => '2025-06-15', 'course_content_id' => $course->id,
        'user_id' => $this->user->id, 'status' => 1,
    ]);

    $response = $this->getJson('/api/dashboard');

    $response->assertOk()
        ->assertJsonPath('data.total_task', 2)
        ->assertJsonPath('data.completed_task', 1)
        ->assertJsonPath('data.uncompleted_task', 1)
        ->assertJsonCount(2, 'data.tasks');
});

test('dashboard returns zeroes for empty user', function () {
    $response = $this->getJson('/api/dashboard');

    $response->assertOk()
        ->assertJsonPath('data.total_task', 0)
        ->assertJsonPath('data.completed_task', 0)
        ->assertJsonPath('data.uncompleted_task', 0);
});

test('dashboard requires authentication', function () {
    $this->app->get('auth')->forgetGuards();

    $response = $this->getJson('/api/dashboard');

    $response->assertStatus(401);
});

// ─── GET /api/dashboard/chart ───

test('chart returns per-course breakdown for semester', function () {
    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $this->user->id,
    ]);

    Task::create([
        'task' => 'PR', 'deadline' => '2025-12-31', 'course_content_id' => $course->id,
        'user_id' => $this->user->id, 'status' => 1,
    ]);

    $response = $this->getJson('/api/dashboard/chart?semester=2024/2025+Ganjil');

    $response->assertOk()
        ->assertJsonPath('data.semester', '2024/2025 Ganjil')
        ->assertJsonPath('data.total_task', 1)
        ->assertJsonCount(1, 'data.course_contents');
});

// ─── GET /api/dashboard/semester-overview ───

test('semester-overview returns aggregated semester data', function () {
    \App\Models\Grade::insert([
        ['grade' => 'A', 'grade_point' => 4.00, 'minimal_score' => 80, 'maximal_score' => 100, 'user_id' => $this->user->id],
    ]);

    CourseContent::create([
        'semester' => 'Semester 1', 'code' => 'MK001', 'course_content' => 'Kalkulus',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => 85, 'user_id' => $this->user->id,
    ]);

    $response = $this->getJson('/api/dashboard/semester-overview');

    $response->assertOk()
        ->assertJsonPath('data.total_credits_all', 3)
        ->assertJsonCount(1, 'data.semesters');
});
