<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

// Auth endpoint tests — no global actingAs since some endpoints are public

// ─── POST /api/auth/register ───

test('register creates user and returns token', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('code', 201)
        ->assertJsonPath('data.user.name', 'Test User')
        ->assertJsonStructure(['data' => ['token', 'user']]);
});

test('register rejects duplicate email', function () {
    User::factory()->create(['email' => 'test@example.com']);

    $response = $this->postJson('/api/auth/register', [
        'name' => 'Test',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(422);
});

test('register requires password confirmation to match', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => 'Test',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'different',
    ]);

    $response->assertStatus(422);
});

test('register requires minimum 8 character password', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => 'Test',
        'email' => 'test@example.com',
        'password' => 'short',
        'password_confirmation' => 'short',
    ]);

    $response->assertStatus(422);
});

// ─── POST /api/auth/login ───

test('login returns token with valid credentials', function () {
    // Use hash so the password is stored correctly
    User::factory()->create([
        'email' => 'login@example.com',
        'password' => \Illuminate\Support\Facades\Hash::make('password'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'login@example.com',
        'password' => 'password',
    ]);

    $response->assertOk()
        ->assertJsonPath('code', 200)
        ->assertJsonStructure(['data' => ['token', 'user']]);
});

test('login returns 401 with wrong credentials', function () {
    User::factory()->create([
        'email' => 'login@example.com',
        'password' => \Illuminate\Support\Facades\Hash::make('password'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'login@example.com',
        'password' => 'wrong',
    ]);

    $response->assertStatus(401);
});

// ─── Authenticated endpoint tests ───

test('checkToken returns valid for authenticated user', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $token = $user->createToken('test', ['*'], now()->addHour())->plainTextToken;

    $response = $this->getJson('/api/auth/check/token', [
        'Authorization' => 'Bearer ' . $token,
    ]);

    $response->assertOk()
        ->assertJsonPath('data.valid', true);
});

test('checkEmail returns verified true for verified user', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $token = $user->createToken('test', ['*'], now()->addHour())->plainTextToken;

    $response = $this->getJson('/api/auth/check/email', [
        'Authorization' => 'Bearer ' . $token,
    ]);

    $response->assertOk()
        ->assertJsonPath('data.verified', true);
});

test('checkEmail returns verified false for unverified user', function () {
    $unverified = User::factory()->unverified()->create();
    $token = $unverified->createToken('test', ['*'], now()->addHour())->plainTextToken;

    $response = $this->getJson('/api/auth/check/email', [
        'Authorization' => 'Bearer ' . $token,
    ]);

    $response->assertOk()
        ->assertJsonPath('data.verified', false);
});

test('logout deletes current token', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $token = $user->createToken('test', ['*'], now()->addHour())->plainTextToken;

    $response = $this->postJson('/api/auth/logout', [], [
        'Authorization' => 'Bearer ' . $token,
    ]);

    $response->assertOk()
        ->assertJsonPath('message', 'User logged out successfully');
});
