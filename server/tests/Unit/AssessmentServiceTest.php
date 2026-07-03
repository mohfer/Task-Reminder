<?php

use App\Models\CourseContent;
use App\Models\Grade;
use App\Models\User;
use App\Services\AssessmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(Tests\TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->service = new AssessmentService();
});

// ─── calculateGpa ───

test('calculateGpa returns empty course_contents and zero gpa when user has no courses', function () {
    $result = $this->service->calculateGpa($this->user->id, null);

    expect($result)->toHaveKeys(['semester_gpa', 'cumulative_gpa', 'gpa_per_semester', 'course_contents']);
    expect($result['semester_gpa'])->toBe('0.00');
    expect($result['cumulative_gpa'])->toBe('0.00');
    expect($result['course_contents'])->toBeEmpty();
});

test('calculateGpa computes correct per-semester and cumulative gpa', function () {
    Grade::insert([
        ['grade' => 'A', 'grade_point' => 4.00, 'minimal_score' => 80, 'maximal_score' => 100, 'user_id' => $this->user->id],
        ['grade' => 'B', 'grade_point' => 3.00, 'minimal_score' => 70, 'maximal_score' => 79, 'user_id' => $this->user->id],
    ]);

    CourseContent::insert([
        ['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => 85, 'user_id' => $this->user->id],
        ['semester' => '2024/2025 Ganjil', 'code' => 'MK002', 'course_content' => 'Fisika I', 'credits' => 2, 'lecturer' => 'B', 'day' => 'Selasa', 'hour_start' => '10:00', 'hour_end' => '12:00', 'score' => 75, 'user_id' => $this->user->id],
    ]);

    CourseContent::create(['semester' => '2024/2025 Genap', 'code' => 'MK003', 'course_content' => 'Algoritma', 'credits' => 4, 'lecturer' => 'C', 'day' => 'Rabu', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => 90, 'user_id' => $this->user->id]);

    $result = $this->service->calculateGpa($this->user->id, '2024/2025 Ganjil');

    expect($result['semester_gpa'])->toBe('3.60');
    expect($result['cumulative_gpa'])->toBe('3.78');
    expect($result['course_contents'])->toHaveCount(2);
});

test('calculateGpa excludes semesters with missing scores from cumulative', function () {
    Grade::insert([
        ['grade' => 'A', 'grade_point' => 4.00, 'minimal_score' => 80, 'maximal_score' => 100, 'user_id' => $this->user->id],
    ]);

    CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => 85, 'user_id' => $this->user->id]);
    CourseContent::create(['semester' => '2024/2025 Genap', 'code' => 'MK002', 'course_content' => 'Fisika I', 'credits' => 2, 'lecturer' => 'B', 'day' => 'Selasa', 'hour_start' => '10:00', 'hour_end' => '12:00', 'score' => null, 'user_id' => $this->user->id]);

    $result = $this->service->calculateGpa($this->user->id, '2024/2025 Ganjil');

    expect($result['semester_gpa'])->toBe('4.00');
    expect($result['cumulative_gpa'])->toBe('4.00');
    expect($result['gpa_per_semester']['2024/2025 Genap'])->toBe('0.00');
});

test('calculateGpa handles score=0 correctly', function () {
    Grade::insert([
        ['grade' => 'E', 'grade_point' => 0.00, 'minimal_score' => 0, 'maximal_score' => 49, 'user_id' => $this->user->id],
    ]);

    CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => 0, 'user_id' => $this->user->id]);

    $result = $this->service->calculateGpa($this->user->id, '2024/2025 Ganjil');

    expect($result['semester_gpa'])->toBe('0.00');
    expect($result['course_contents'][0]['score'])->toBe('0.00');
    expect($result['course_contents'][0]['grade'])->toBe('E');
});

// ─── updateScore ───

test('updateScore sets score on course content owned by user', function () {
    $course = CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    $updated = $this->service->updateScore($this->user->id, $course->id, 85.5);

    expect($updated->score)->toBe(85.5);
});

test('updateScore can set score to null to clear it', function () {
    $course = CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => 85, 'user_id' => $this->user->id]);

    $updated = $this->service->updateScore($this->user->id, $course->id, null);

    expect($updated->score)->toBeNull();
});

test('updateScore throws 404 for another users course', function () {
    $otherUser = User::factory()->create();
    $course = CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $otherUser->id]);

    $this->service->updateScore($this->user->id, $course->id, 90);
})->throws(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

// ─── syncFromMonitoring ───

test('syncFromMonitoring updates matching course scores from monitoring data', function () {
    Http::fake([
        'http://localhost:8000/tasks/1/data' => Http::response([
            'code' => 200,
            'message' => 'Success',
            'data' => [
                'nama' => 'Test Student',
                'nilai' => [
                    ['matkul' => 'Kalkulus I', 'sks' => 3, 'nilai' => '85', 'mutu' => '4.00'],
                    ['matkul' => 'Fisika I', 'sks' => 2, 'nilai' => '70', 'mutu' => '3.00'],
                ],
            ],
        ], 200),
    ]);

    CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);
    CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK002', 'course_content' => 'Fisika I', 'credits' => 2, 'lecturer' => 'B', 'day' => 'Selasa', 'hour_start' => '10:00', 'hour_end' => '12:00', 'score' => null, 'user_id' => $this->user->id]);

    $result = $this->service->syncFromMonitoring($this->user->id, 'http://localhost:8000', 1);

    expect($result['updated'])->toBe(2);
    expect($result['skipped'])->toBeEmpty();

    expect((float) CourseContent::where('course_content', 'Kalkulus I')->first()->score)->toBe(85.0);
});

test('syncFromMonitoring skips courses with non-numeric grades', function () {
    Http::fake([
        'http://localhost:8000/tasks/1/data' => Http::response([
            'data' => [
                'nilai' => [
                    ['matkul' => 'Kalkulus I', 'sks' => 3, 'nilai' => 'A', 'mutu' => '4.00'],
                ],
            ],
        ], 200),
    ]);

    CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    $result = $this->service->syncFromMonitoring($this->user->id, 'http://localhost:8000', 1);

    expect($result['updated'])->toBe(0);
    expect($result['skipped'])->toContain('Kalkulus I');
});

test('syncFromMonitoring skips courses with placeholder dashes', function () {
    Http::fake([
        'http://localhost:8000/tasks/1/data' => Http::response([
            'data' => [
                'nilai' => [
                    ['matkul' => 'Kalkulus I', 'sks' => 3, 'nilai' => '---', 'mutu' => '---'],
                ],
            ],
        ], 200),
    ]);

    CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    $result = $this->service->syncFromMonitoring($this->user->id, 'http://localhost:8000', 1);

    expect($result['updated'])->toBe(0);
    expect($result['skipped'])->toContain('Kalkulus I');
});

test('syncFromMonitoring skips courses not found in user course_contents', function () {
    Http::fake([
        'http://localhost:8000/tasks/1/data' => Http::response([
            'data' => [
                'nilai' => [
                    ['matkul' => 'Statistika', 'sks' => 3, 'nilai' => '80', 'mutu' => '4.00'],
                ],
            ],
        ], 200),
    ]);

    $result = $this->service->syncFromMonitoring($this->user->id, 'http://localhost:8000', 1);

    expect($result['updated'])->toBe(0);
    expect($result['skipped'])->toContain('Statistika');
});

test('syncFromMonitoring matches courses case-insensitively', function () {
    Http::fake([
        'http://localhost:8000/tasks/1/data' => Http::response([
            'data' => [
                'nilai' => [
                    ['matkul' => 'kalkulus i', 'sks' => 3, 'nilai' => '92', 'mutu' => '4.00'],
                ],
            ],
        ], 200),
    ]);

    CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    $result = $this->service->syncFromMonitoring($this->user->id, 'http://localhost:8000', 1);

    expect($result['updated'])->toBe(1);
});

test('syncFromMonitoring throws when monitoring API returns error', function () {
    Http::fake([
        'http://localhost:8000/tasks/1/data' => Http::response('Not Found', 404),
    ]);

    $this->service->syncFromMonitoring($this->user->id, 'http://localhost:8000', 1);
})->throws(\Exception::class, 'Failed to fetch');

test('syncFromMonitoring throws when response has no nilai array', function () {
    Http::fake([
        'http://localhost:8000/tasks/1/data' => Http::response([
            'data' => ['nama' => 'Test', 'nilai' => null],
        ], 200),
    ]);

    $this->service->syncFromMonitoring($this->user->id, 'http://localhost:8000', 1);
})->throws(\Exception::class, 'No grade data');
