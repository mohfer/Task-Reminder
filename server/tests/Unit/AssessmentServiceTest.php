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

test('syncFromMonitoring filters by active semester and ignores other semesters', function () {
    Http::fake([
        'http://localhost:8000/tasks/1/data' => Http::response([
            'code' => 200,
            'message' => 'Success',
            'data' => [
                'nilai' => [
                    ['matkul' => 'Jaringan Komputer', 'sks' => 3, 'nilai' => '88', 'mutu' => '4.00'],
                ],
            ],
        ], 200),
    ]);

    // Same course name in two semesters
    CourseContent::create(['semester' => 'Semester 3', 'code' => 'MK001', 'course_content' => 'Jaringan Komputer', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);
    CourseContent::create(['semester' => 'Semester 4', 'code' => 'MK001', 'course_content' => 'Jaringan Komputer', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    // Sync only Semester 4 (active semester)
    $result = $this->service->syncFromMonitoring($this->user->id, 'http://localhost:8000', 1, 'Semester 4');

    expect($result['updated'])->toBe(1);

    $semester3Course = CourseContent::where('course_content', 'Jaringan Komputer')->where('semester', 'Semester 3')->first();
    $semester4Course = CourseContent::where('course_content', 'Jaringan Komputer')->where('semester', 'Semester 4')->first();

    // Semester 3 should NOT be updated
    expect($semester3Course->score)->toBeNull();
    // Semester 4 should be updated
    expect((float) $semester4Course->score)->toBe(88.0);
});

test('syncFromMonitoring syncs across all semesters when no semester filter given', function () {
    Http::fake([
        'http://localhost:8000/tasks/1/data' => Http::response([
            'code' => 200,
            'message' => 'Success',
            'data' => [
                'nilai' => [
                    ['matkul' => 'Jaringan Komputer', 'sks' => 3, 'nilai' => '90', 'mutu' => '4.00'],
                ],
            ],
        ], 200),
    ]);

    CourseContent::create(['semester' => 'Semester 3', 'code' => 'MK001', 'course_content' => 'Jaringan Komputer', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    // No semester filter — matches the first (and only) one
    $result = $this->service->syncFromMonitoring($this->user->id, 'http://localhost:8000', 1);

    expect($result['updated'])->toBe(1);
});

test('syncFromMonitoring matches by stripped course name ignoring parenthetical codes', function () {
    Http::fake([
        'http://localhost:8000/tasks/1/data' => Http::response([
            'data' => [
                'nilai' => [
                    ['matkul' => 'Sistem Terdistribusi (INF622208)', 'sks' => 3, 'nilai' => '82', 'mutu' => '4.00'],
                ],
            ],
        ], 200),
    ]);

    CourseContent::create(['semester' => 'Semester 4', 'code' => 'INF622208', 'course_content' => 'Sistem Terdistribusi (C)', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    $result = $this->service->syncFromMonitoring($this->user->id, 'http://localhost:8000', 1, 'Semester 4');

    expect($result['updated'])->toBe(1);
});

test('syncFromMonitoring handles response without data wrapper', function () {
    Http::fake([
        'http://localhost:8000/tasks/1/data' => Http::response([
            'nilai' => [
                ['matkul' => 'Kalkulus', 'sks' => 3, 'nilai' => '80', 'mutu' => '4.00'],
            ],
        ], 200),
    ]);

    CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    $result = $this->service->syncFromMonitoring($this->user->id, 'http://localhost:8000', 1);

    expect($result['updated'])->toBe(1);
});

test('syncFromMonitoring skips when no course matches within filtered semester', function () {
    Http::fake([
        'http://localhost:8000/tasks/1/data' => Http::response([
            'data' => [
                'nilai' => [
                    ['matkul' => 'Jaringan Komputer', 'sks' => 3, 'nilai' => '88', 'mutu' => '4.00'],
                ],
            ],
        ], 200),
    ]);

    // Course exists but only in Semester 3
    CourseContent::create(['semester' => 'Semester 3', 'code' => 'MK001', 'course_content' => 'Jaringan Komputer', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    // Sync for Semester 4 — no matching course there
    $result = $this->service->syncFromMonitoring($this->user->id, 'http://localhost:8000', 1, 'Semester 4');

    expect($result['updated'])->toBe(0);
    expect($result['skipped'])->toContain('Jaringan Komputer');
});
