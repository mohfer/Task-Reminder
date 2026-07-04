<?php

use App\Models\CourseContent;
use App\Models\Grade;
use App\Models\Task;
use App\Models\User;
use App\Services\DashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->service = new DashboardService();
    $this->user = User::factory()->create();
});

// ─── getDashboard ───

test('getDashboard returns counts and tasks for user', function () {
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

    $result = $this->service->getDashboard($this->user->id);

    expect($result['total_task'])->toBe(2);
    expect($result['completed_task'])->toBe(1);
    expect($result['uncompleted_task'])->toBe(1);
    expect($result['tasks'])->toHaveCount(2);
    expect($result['tasks'][0])->toHaveKey('deadline_label');
});

test('getDashboard returns zero counts for user with no tasks', function () {
    $result = $this->service->getDashboard($this->user->id);

    expect($result['total_task'])->toBe(0);
    expect($result['completed_task'])->toBe(0);
    expect($result['uncompleted_task'])->toBe(0);
    expect($result['tasks'])->toBeEmpty();
});

// ─── getChart ───

test('getChart returns per-course task breakdown for a semester', function () {
    $course1 = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $this->user->id,
    ]);
    $course2 = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK002', 'course_content' => 'Fisika',
        'credits' => 2, 'lecturer' => 'B', 'day' => 'Selasa',
        'hour_start' => '10:00', 'hour_end' => '12:00', 'user_id' => $this->user->id,
    ]);

    Task::create([
        'task' => 'PR Kalkulus', 'deadline' => '2025-12-31', 'course_content_id' => $course1->id,
        'user_id' => $this->user->id, 'status' => 1,
    ]);
    Task::create([
        'task' => 'PR Fisika', 'deadline' => '2025-12-31', 'course_content_id' => $course2->id,
        'user_id' => $this->user->id, 'status' => 0,
    ]);

    $result = $this->service->getChart($this->user->id, '2024/2025 Ganjil');

    expect($result['semester'])->toBe('2024/2025 Ganjil');
    expect($result['course_contents'])->toHaveCount(2);
    expect($result['completed_task'])->toBe(1);
    expect($result['uncompleted_task'])->toBe(1);
    expect($result['total_task'])->toBe(2);
});

test('getChart returns empty for unknown semester', function () {
    $result = $this->service->getChart($this->user->id, 'Unknown');

    expect($result['course_contents'])->toBeEmpty();
    expect($result['total_task'])->toBe(0);
});

// ─── getSemesterOverview ───

test('getSemesterOverview returns aggregated data per semester', function () {
    Grade::insert([
        ['grade' => 'A', 'grade_point' => 4.00, 'minimal_score' => 80, 'maximal_score' => 100, 'user_id' => $this->user->id],
        ['grade' => 'B', 'grade_point' => 3.00, 'minimal_score' => 70, 'maximal_score' => 79, 'user_id' => $this->user->id],
    ]);

    $course1 = CourseContent::create([
        'semester' => 'Semester 1', 'code' => 'MK001', 'course_content' => 'Kalkulus',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => 85, 'user_id' => $this->user->id,
    ]);
    $course2 = CourseContent::create([
        'semester' => 'Semester 1', 'code' => 'MK002', 'course_content' => 'Fisika',
        'credits' => 2, 'lecturer' => 'B', 'day' => 'Selasa',
        'hour_start' => '10:00', 'hour_end' => '12:00', 'score' => 75, 'user_id' => $this->user->id,
    ]);
    $course3 = CourseContent::create([
        'semester' => 'Semester 2', 'code' => 'MK003', 'course_content' => 'Algoritma',
        'credits' => 4, 'lecturer' => 'C', 'day' => 'Rabu',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => 90, 'user_id' => $this->user->id,
    ]);

    Task::create([
        'task' => 'PR', 'deadline' => '2025-12-31', 'course_content_id' => $course1->id,
        'user_id' => $this->user->id, 'status' => 1,
    ]);

    $result = $this->service->getSemesterOverview($this->user->id);

    expect($result['semesters'])->toHaveCount(2);
    expect($result['cumulative_gpa'])->toBeGreaterThan(0);
    expect($result['total_credits_all'])->toBe(9);
    expect($result['total_task_all'])->toBe(1);
    expect($result['completed_task_all'])->toBe(1);
    expect($result['uncompleted_task_all'])->toBe(0);
});

test('getSemesterOverview returns empty for user with no courses', function () {
    $result = $this->service->getSemesterOverview($this->user->id);

    expect($result['semesters'])->toBeEmpty();
    expect($result['cumulative_gpa'])->toBe(0);
});
