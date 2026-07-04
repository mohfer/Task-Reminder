<?php

use App\Models\CourseContent;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    Sanctum::actingAs($this->user, ['*']);
});

// ─── POST /api/course-contents ───

test('create course content returns 201', function () {
    $response = $this->postJson('/api/course-contents', [
        'semester' => '2024/2025 Ganjil',
        'code' => 'MK001',
        'course_content' => 'Kalkulus I',
        'credits' => 3,
        'lecturer' => 'Dr. A',
        'day' => 'Senin',
        'hour_start' => '08:00',
        'hour_end' => '10:00',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('code', 201)
        ->assertJsonPath('data.course_content', 'Kalkulus I');
});

test('create course content returns 409 on duplicate code in same semester', function () {
    CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Original',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $this->user->id,
    ]);

    $response = $this->postJson('/api/course-contents', [
        'semester' => '2024/2025 Ganjil',
        'code' => 'MK001',
        'course_content' => 'Different',
        'credits' => 3,
        'lecturer' => 'B',
        'day' => 'Selasa',
        'hour_start' => '08:00',
        'hour_end' => '10:00',
    ]);

    $response->assertStatus(409);
});

test('create course content validates required fields', function () {
    $response = $this->postJson('/api/course-contents', []);

    $response->assertStatus(422);
});

// ─── PUT /api/course-contents/{id} ───

test('update course content modifies existing', function () {
    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $this->user->id,
    ]);

    $response = $this->putJson("/api/course-contents/{$course->id}", [
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I (Update)',
        'credits' => 4, 'lecturer' => 'Prof. B', 'day' => 'Rabu',
        'hour_start' => '10:00', 'hour_end' => '12:00',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.credits', 4);
});

test('update course content returns 404 for another user course', function () {
    $otherUser = User::factory()->create();
    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $otherUser->id,
    ]);

    $response = $this->putJson("/api/course-contents/{$course->id}", [
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Hijack',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00',
    ]);

    $response->assertStatus(404);
});

// ─── DELETE /api/course-contents/{id} ───

test('delete course content removes it', function () {
    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $this->user->id,
    ]);

    $response = $this->deleteJson("/api/course-contents/{$course->id}");

    $response->assertOk();
    expect(CourseContent::find($course->id))->toBeNull();
});

test('delete course content returns 404 for another user course', function () {
    $otherUser = User::factory()->create();
    $course = CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus I',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $otherUser->id,
    ]);

    $response = $this->deleteJson("/api/course-contents/{$course->id}");

    $response->assertStatus(404);
});

// ─── GET /api/course-contents/filter ───

test('filter returns courses for semester ordered by day', function () {
    CourseContent::insert([
        ['semester' => '2024/2025 Ganjil', 'code' => 'MK002', 'course_content' => 'Fisika', 'credits' => 2, 'lecturer' => 'B', 'day' => 'Selasa', 'hour_start' => '10:00', 'hour_end' => '12:00', 'user_id' => $this->user->id],
        ['semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Kalkulus', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $this->user->id],
    ]);

    $response = $this->getJson('/api/course-contents/filter?semester=2024/2025+Ganjil');

    $response->assertOk()
        ->assertJsonPath('data.total_credits', 5)
        ->assertJsonCount(2, 'data.course_contents')
        // Senin before Selasa
        ->assertJsonPath('data.course_contents.0.course_content', 'Kalkulus');
});
