<?php

use App\Models\CourseContent;
use App\Models\Grade;
use App\Models\Setting;
use App\Models\User;
use App\Services\SiakangClient;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    Sanctum::actingAs($this->user, ['*']);
    $this->siakangClient = Mockery::mock(SiakangClient::class);
    $this->app->instance(SiakangClient::class, $this->siakangClient);
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

test('sync endpoint updates scores from siakang data and returns result', function () {
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
                ],
            ],
        ]);

    CourseContent::create(['semester' => 'Semester 2', 'code' => 'MK001', 'course_content' => 'Kalkulus I', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'score' => null, 'user_id' => $this->user->id]);

    $response = $this->postJson('/api/assessments/sync', [
        'semester' => 'Semester 2',
        'source_semester' => '20251',
    ]);

    $response->assertOk()
        ->assertJsonPath('code', 200)
        ->assertJsonPath('data.updated', 1)
        ->assertJsonPath('data.no_match', [])
        ->assertJsonPath('data.unchanged', 0);

    expect((float) CourseContent::first()->score)->toBe(85.0);
});

test('sync endpoint returns error when siakang credentials are missing', function () {
    $response = $this->postJson('/api/assessments/sync', [
        'semester' => 'Semester 2',
        'source_semester' => '20251',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('message', 'Siakang credentials are not configured. Add them in Settings.');
});

test('sync endpoint returns error when siakang login fails', function () {
    Setting::factory()->withSiakangCredentials()->create(['user_id' => $this->user->id]);

    $this->siakangClient->shouldReceive('getGrades')
        ->once()
        ->andReturn(['code' => 401, 'message' => 'Login failed — check email/password']);

    $response = $this->postJson('/api/assessments/sync', [
        'semester' => 'Semester 2',
        'source_semester' => '20251',
    ]);

    $response->assertStatus(401)
        ->assertJsonPath('message', 'Login failed — check email/password');
});

test('sync endpoint returns 422 when no courses match the target semester', function () {
    Setting::factory()->withSiakangCredentials()->create(['user_id' => $this->user->id]);

    $this->siakangClient->shouldReceive('getGrades')
        ->once()
        ->andReturn([
            'code' => 200,
            'message' => 'Success',
            'data' => [
                'ip' => null,
                'ipk' => null,
                'courses' => [
                    ['no' => 1, 'code' => 'MK099', 'name' => 'Statistika', 'credits' => 3, 'score' => 80.0, 'letter' => 'A'],
                ],
            ],
        ]);

    // No CourseContent exists in the target semester, so nothing can match.
    $response = $this->postJson('/api/assessments/sync', [
        'semester' => 'Semester 4',
        'source_semester' => '20251',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('message', 'No matching scores found — 1 course(s) not found in Semester 4');
});
