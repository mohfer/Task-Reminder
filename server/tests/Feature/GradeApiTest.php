<?php

use App\Models\Grade;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    Sanctum::actingAs($this->user, ['*']);
});

// ─── GET /api/settings/grades ───

test('list grades returns ordered grades', function () {
    Grade::insert([
        ['grade' => 'B', 'grade_point' => 3.00, 'minimal_score' => 70, 'maximal_score' => 74.99, 'user_id' => $this->user->id],
        ['grade' => 'A', 'grade_point' => 4.00, 'minimal_score' => 85, 'maximal_score' => 100, 'user_id' => $this->user->id],
    ]);

    $response = $this->getJson('/api/settings/grades');

    $response->assertOk()
        ->assertJsonPath('code', 200)
        ->assertJsonPath('data.0.grade', 'A')
        ->assertJsonPath('data.1.grade', 'B');
});

test('list grades returns empty for user with no grades', function () {
    $response = $this->getJson('/api/settings/grades');

    $response->assertOk()
        ->assertJsonPath('data', []);
});

// ─── POST /api/settings/grades ───

test('create grade returns 201', function () {
    $response = $this->postJson('/api/settings/grades', [
        'grade' => 'X',
        'grade_point' => 4.00,
        'minimal_score' => 85,
        'maximal_score' => 100,
    ]);

    // X is not one of the default grades so it won't conflict
    $response->assertStatus(201)
        ->assertJsonPath('data.grade', 'X');
});

test('create grade rejects duplicate grade name for same user', function () {
    Grade::create([
        'grade' => 'A', 'grade_point' => 4.00, 'minimal_score' => 85, 'maximal_score' => 100,
        'user_id' => $this->user->id,
    ]);

    $response = $this->postJson('/api/settings/grades', [
        'grade' => 'A',
        'grade_point' => 4.00,
        'minimal_score' => 85,
        'maximal_score' => 100,
    ]);

    $response->assertStatus(422);
});

test('create grade validates score range 0-100', function () {
    $response = $this->postJson('/api/settings/grades', [
        'grade' => 'Z',
        'grade_point' => 4.00,
        'minimal_score' => -1,
        'maximal_score' => 101,
    ]);

    $response->assertStatus(422);
});

// ─── PUT /api/settings/grades/{id} ───

test('update grade modifies existing', function () {
    $grade = Grade::create([
        'grade' => 'B', 'grade_point' => 3.00, 'minimal_score' => 70, 'maximal_score' => 74.99,
        'user_id' => $this->user->id,
    ]);

    $response = $this->putJson("/api/settings/grades/{$grade->id}", [
        'grade' => 'B',
        'grade_point' => 3.50,
        'minimal_score' => 75,
        'maximal_score' => 79.99,
    ]);

    $response->assertOk()
        ->assertJsonPath('data.grade_point', 3.5);
});

test('update grade returns 404 for another user grade', function () {
    $otherUser = User::factory()->create();
    $grade = Grade::create([
        'grade' => 'A', 'grade_point' => 4.00, 'minimal_score' => 85, 'maximal_score' => 100,
        'user_id' => $otherUser->id,
    ]);

    $response = $this->putJson("/api/settings/grades/{$grade->id}", [
        'grade' => 'A',
        'grade_point' => 3.00,
        'minimal_score' => 70,
        'maximal_score' => 79.99,
    ]);

    $response->assertStatus(404);
});

// ─── DELETE /api/settings/grades/{id} ───

test('delete grade removes it', function () {
    $grade = Grade::create([
        'grade' => 'Z', 'grade_point' => 1.00, 'minimal_score' => 0, 'maximal_score' => 10,
        'user_id' => $this->user->id,
    ]);

    $response = $this->deleteJson("/api/settings/grades/{$grade->id}");

    $response->assertOk();
    expect(Grade::find($grade->id))->toBeNull();
});

test('delete grade returns 404 for another user grade', function () {
    $otherUser = User::factory()->create();
    $grade = Grade::create([
        'grade' => 'A', 'grade_point' => 4.00, 'minimal_score' => 85, 'maximal_score' => 100,
        'user_id' => $otherUser->id,
    ]);

    $response = $this->deleteJson("/api/settings/grades/{$grade->id}");

    $response->assertStatus(404);
});
