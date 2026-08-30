<?php

use App\Models\CourseContent;
use App\Models\Grade;
use App\Models\Setting;
use App\Models\User;
use App\Services\AssessmentService;
use App\Services\SiakangClient;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->siakangClient = Mockery::mock(SiakangClient::class);
    $this->service = new AssessmentService($this->siakangClient);
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
})->throws(ModelNotFoundException::class);

// ─── syncScoresFromSiakang ───

test('syncScoresFromSiakang requires siakang credentials', function () {
    $this->service->syncScoresFromSiakang($this->user->id, 'Semester 2', '20251');
})->throws(Exception::class, 'Siakang credentials are not configured', 422);

test('syncScoresFromSiakang updates matching course scores from siakang data', function () {
    Setting::factory()->withSiakangCredentials()->create(['user_id' => $this->user->id]);

    $this->siakangClient->shouldReceive('getGrades')
        ->once()
        ->with('student@student.untirta.ac.id', 'secret', '20251')
        ->andReturn([
            'code' => 200,
            'message' => 'Success',
            'data' => [
                'ip' => 3.6,
                'ipk' => 3.5,
                'courses' => [
                    ['no' => 1, 'code' => 'MK001', 'name' => 'Kalkulus I', 'credits' => 3, 'score' => 85.0, 'letter' => 'B+'],
                    ['no' => 2, 'code' => 'MK002', 'name' => 'Fisika I', 'credits' => 2, 'score' => 70.0, 'letter' => 'B'],
                ],
            ],
        ]);

    CourseContent::create(['semester' => 'Semester 2', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);
    CourseContent::create(['semester' => 'Semester 2', 'code' => 'MK002', 'course_content' => 'Fisika I', 'credits' => 2, 'lecturer' => 'B', 'day' => 'Selasa', 'hour_start' => '10:00', 'hour_end' => '12:00', 'score' => null, 'user_id' => $this->user->id]);

    $result = $this->service->syncScoresFromSiakang($this->user->id, 'Semester 2', '20251');

    expect($result['updated'])->toBe(2);
    expect($result['no_match'])->toBeEmpty();
    expect($result['semester_label'])->toBe('Semester 2');
    expect($result['ip'])->toBe(3.6);

    expect((float) CourseContent::where('course_content', 'Kalkulus I')->first()->score)->toBe(85.0);
});

test('syncScoresFromSiakang skips courses with null scores', function () {
    Setting::factory()->withSiakangCredentials()->create(['user_id' => $this->user->id]);

    $this->siakangClient->shouldReceive('getGrades')->once()->andReturn([
        'code' => 200,
        'message' => 'Success',
        'data' => [
            'ip' => null,
            'ipk' => null,
            'courses' => [
                ['no' => 1, 'code' => 'MK001', 'name' => 'Kalkulus I', 'credits' => 3, 'score' => null, 'letter' => null],
            ],
        ],
    ]);

    CourseContent::create(['semester' => 'Semester 2', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    $result = $this->service->syncScoresFromSiakang($this->user->id, 'Semester 2', '20251');

    expect($result['updated'])->toBe(0);
    expect($result['no_match'])->toContain('Kalkulus I (nilai belum keluar)');
});

test('syncScoresFromSiakang skips courses not found in user course_contents', function () {
    Setting::factory()->withSiakangCredentials()->create(['user_id' => $this->user->id]);

    $this->siakangClient->shouldReceive('getGrades')->once()->andReturn([
        'code' => 200,
        'message' => 'Success',
        'data' => [
            'ip' => 2.0,
            'ipk' => null,
            'courses' => [
                ['no' => 1, 'code' => 'MK099', 'name' => 'Statistika', 'credits' => 3, 'score' => 80.0, 'letter' => 'A'],
            ],
        ],
    ]);

    $result = $this->service->syncScoresFromSiakang($this->user->id, 'Semester 2', '20251');

    expect($result['updated'])->toBe(0);
    expect($result['no_match'])->toContain('Statistika');
});

test('syncScoresFromSiakang matches courses case-insensitively', function () {
    Setting::factory()->withSiakangCredentials()->create(['user_id' => $this->user->id]);

    $this->siakangClient->shouldReceive('getGrades')->once()->andReturn([
        'code' => 200,
        'message' => 'Success',
        'data' => [
            'ip' => 4.0,
            'ipk' => null,
            'courses' => [
                ['no' => 1, 'code' => 'MK001', 'name' => 'kalkulus i', 'credits' => 3, 'score' => 92.0, 'letter' => 'A'],
            ],
        ],
    ]);

    CourseContent::create(['semester' => 'Semester 2', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    $result = $this->service->syncScoresFromSiakang($this->user->id, 'Semester 2', '20251');

    expect($result['updated'])->toBe(1);
});

test('syncScoresFromSiakang throws when siakang returns error code', function () {
    Setting::factory()->withSiakangCredentials()->create(['user_id' => $this->user->id]);

    $this->siakangClient->shouldReceive('getGrades')->once()->andReturn([
        'code' => 401,
        'message' => 'Login failed — check email/password',
    ]);

    $this->service->syncScoresFromSiakang($this->user->id, 'Semester 2', '20251');
})->throws(Exception::class, 'Login failed', 401);

test('syncScoresFromSiakang throws when response has no courses array', function () {
    Setting::factory()->withSiakangCredentials()->create(['user_id' => $this->user->id]);

    $this->siakangClient->shouldReceive('getGrades')->once()->andReturn([
        'code' => 200,
        'message' => 'Success',
        'data' => ['ip' => null, 'ipk' => null, 'courses' => []],
    ]);

    $this->service->syncScoresFromSiakang($this->user->id, 'Semester 2', '20251');
})->throws(Exception::class, 'No grade data found');

test('syncScoresFromSiakang filters by mapped semester label', function () {
    Setting::factory()->withSiakangCredentials()->create(['user_id' => $this->user->id]);

    $this->siakangClient->shouldReceive('getGrades')->once()->andReturn([
        'code' => 200,
        'message' => 'Success',
        'data' => [
            'ip' => 3.8,
            'ipk' => null,
            'courses' => [
                ['no' => 1, 'code' => 'MK001', 'name' => 'Jaringan Komputer', 'credits' => 3, 'score' => 88.0, 'letter' => 'A'],
            ],
        ],
    ]);

    // Same course name in two semesters
    CourseContent::create(['semester' => 'Semester 1', 'code' => 'MK001', 'course_content' => 'Jaringan Komputer', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);
    CourseContent::create(['semester' => 'Semester 2', 'code' => 'MK001', 'course_content' => 'Jaringan Komputer', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    // Semester code "20251" maps to "Semester 2" → only that row updated
    $result = $this->service->syncScoresFromSiakang($this->user->id, 'Semester 2', '20251');

    expect($result['updated'])->toBe(1);
    expect($result['semester_label'])->toBe('Semester 2');

    $sem1 = CourseContent::where('semester', 'Semester 1')->first();
    $sem2 = CourseContent::where('semester', 'Semester 2')->first();
    expect($sem1->score)->toBeNull();
    expect((float) $sem2->score)->toBe(88.0);
});

test('syncScoresFromSiakang matches by stripped course name ignoring parenthetical codes', function () {
    Setting::factory()->withSiakangCredentials()->create(['user_id' => $this->user->id]);

    $this->siakangClient->shouldReceive('getGrades')->once()->andReturn([
        'code' => 200,
        'message' => 'Success',
        'data' => [
            'ip' => 3.5,
            'ipk' => null,
            'courses' => [
                ['no' => 1, 'code' => 'INF622208', 'name' => 'Sistem Terdistribusi (INF622208)', 'credits' => 3, 'score' => 82.0, 'letter' => 'A-'],
            ],
        ],
    ]);

    CourseContent::create(['semester' => 'Semester 2', 'code' => 'INF622208', 'course_content' => 'Sistem Terdistribusi (C)', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    $result = $this->service->syncScoresFromSiakang($this->user->id, 'Semester 2', '20251');

    expect($result['updated'])->toBe(1);
});

test('syncScoresFromSiakang counts unchanged scores and does not rewrite them', function () {
    Setting::factory()->withSiakangCredentials()->create(['user_id' => $this->user->id]);

    $this->siakangClient->shouldReceive('getGrades')->once()->andReturn([
        'code' => 200,
        'message' => 'Success',
        'data' => [
            'ip' => 3.6,
            'ipk' => null,
            'courses' => [
                ['no' => 1, 'code' => 'MK001', 'name' => 'Kalkulus I', 'credits' => 3, 'score' => 85.0, 'letter' => 'B+'],
            ],
        ],
    ]);

    $course = CourseContent::create(['semester' => 'Semester 2', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => 85.0, 'user_id' => $this->user->id]);

    $result = $this->service->syncScoresFromSiakang($this->user->id, 'Semester 2', '20251');

    expect($result['updated'])->toBe(0);
    expect($result['unchanged'])->toBe(1);
    expect($result['no_match'])->toBeEmpty();

    $course->refresh();
    expect((float) $course->score)->toBe(85.0);
});
