<?php

use App\Models\CourseContent;
use App\Models\Grade;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    Sanctum::actingAs($this->user, ['*']);
});

// ─── GET /api/assessments/calculate ───

test('calculate endpoint returns course contents and gpa for authenticated user', function () {
    Grade::insert([
        ['grade' => 'A', 'grade_point' => 4.00, 'minimal_score' => 80, 'maximal_score' => 100, 'user_id' => $this->user->id],
    ]);

    CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => 85, 'user_id' => $this->user->id]);

    $response = $this->getJson('/api/assessments/calculate?semester=2024/2025+Ganjil');

    $response->assertOk()
        ->assertJsonPath('code', 200)
        ->assertJsonPath('data.semester_gpa', '4.00')
        ->assertJsonPath('data.cumulative_gpa', '4.00')
        ->assertJsonCount(1, 'data.course_contents');
});

test('calculate endpoint rejects unauthenticated requests', function () {
    // Use actingAs with no token (or clone the app without auth)
    $this->app->get('auth')->forgetGuards();

    $response = $this->getJson('/api/assessments/calculate');

    $response->assertStatus(401);
});

// ─── PATCH /api/assessments/{id} ───

test('update endpoint sets score on owned course content', function () {
    $course = CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    $response = $this->patchJson("/api/assessments/{$course->id}", ['score' => 88]);

    $response->assertOk()
        ->assertJsonPath('code', 200)
        ->assertJsonPath('message', 'Score updated successfully');

    expect((float) $course->fresh()->score)->toBe(88.0);
});

test('update endpoint accepts null score to clear value', function () {
    $course = CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => 85, 'user_id' => $this->user->id]);

    $response = $this->patchJson("/api/assessments/{$course->id}", ['score' => null]);

    $response->assertOk();
    expect($course->fresh()->score)->toBeNull();
});

test('update endpoint rejects score above 100', function () {
    $course = CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    $response = $this->patchJson("/api/assessments/{$course->id}", ['score' => 150]);

    $response->assertStatus(422)
        ->assertJsonPath('message', 'The score field must not be greater than 100.');
});

test('update endpoint rejects score below 0', function () {
    $course = CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    $response = $this->patchJson("/api/assessments/{$course->id}", ['score' => -5]);

    $response->assertStatus(422)
        ->assertJsonPath('message', 'The score field must be at least 0.');
});

test('update endpoint returns 404 for another users course', function () {
    $otherUser = User::factory()->create();
    $course = CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $otherUser->id]);

    $response = $this->patchJson("/api/assessments/{$course->id}", ['score' => 90]);

    $response->assertStatus(404);
});

// ─── POST /api/assessments/sync ───

test('sync endpoint updates scores from monitoring data and returns result', function () {
    Http::fake([
        'http://localhost:8000/tasks/1/data' => Http::response([
            'code' => 200,
            'message' => 'Success',
            'data' => [
                'nilai' => [
                    ['matkul' => 'Kalkulus I', 'sks' => 3, 'nilai' => '85', 'mutu' => '4.00'],
                ],
            ],
        ], 200),
    ]);

    CourseContent::create(['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    $response = $this->postJson('/api/assessments/sync', [
        'source_url' => 'http://localhost:8000',
        'task_id' => 1,
    ]);

    $response->assertOk()
        ->assertJsonPath('code', 200)
        ->assertJsonPath('data.updated', 1)
        ->assertJsonPath('data.skipped', []);

    expect((float) CourseContent::first()->score)->toBe(85.0);
});

test('sync endpoint validates required fields', function () {
    $response = $this->postJson('/api/assessments/sync', []);

    $response->assertStatus(422)
        ->assertJsonPath('message', fn($msg) => str_contains($msg, 'The source url field is required'));
});

test('sync endpoint validates source_url is a valid URL', function () {
    $response = $this->postJson('/api/assessments/sync', [
        'source_url' => 'not-a-url',
        'task_id' => 1,
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('message', fn($msg) => str_contains($msg, 'source url'));
});

test('sync endpoint validates task_id is a positive integer', function () {
    $response = $this->postJson('/api/assessments/sync', [
        'source_url' => 'http://localhost:8000',
        'task_id' => 0,
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('message', 'The task id field must be at least 1.');
});

test('sync endpoint returns error when monitoring API is unreachable', function () {
    Http::fake([
        'http://localhost:8000/*' => Http::response('Server Error', 500),
    ]);

    $response = $this->postJson('/api/assessments/sync', [
        'source_url' => 'http://localhost:8000',
        'task_id' => 1,
    ]);

    $response->assertStatus(502)
        ->assertJsonPath('message', fn($msg) => str_contains($msg, 'Failed to fetch'));
});

test('sync endpoint passes semester to filter matching courses', function () {
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

    // Same name in both semesters
    CourseContent::create(['semester' => 'Semester 3', 'code' => 'MK001', 'course_content' => 'Jaringan Komputer', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);
    CourseContent::create(['semester' => 'Semester 4', 'code' => 'MK001', 'course_content' => 'Jaringan Komputer', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    $response = $this->postJson('/api/assessments/sync', [
        'source_url' => 'http://localhost:8000',
        'task_id' => 1,
        'semester' => 'Semester 4',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.updated', 1);

    // Semester 3 should stay null
    $sem3 = CourseContent::where('semester', 'Semester 3')->first();
    expect($sem3->score)->toBeNull();

    // Semester 4 should be updated
    $sem4 = CourseContent::where('semester', 'Semester 4')->first();
    expect((float) $sem4->score)->toBe(90.0);
});
