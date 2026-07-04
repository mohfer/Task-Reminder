<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    Sanctum::actingAs($this->user, ['*']);
});

// ─── GET /api/auth/user ───

test('get authenticated user returns user with settings', function () {
    $response = $this->getJson('/api/auth/user');

    $response->assertOk()
        ->assertJsonPath('code', 200)
        ->assertJsonPath('data.user.id', $this->user->id)
        ->assertJsonPath('data.user.name', $this->user->name);
});

test('get authenticated user requires auth', function () {
    $this->app->get('auth')->forgetGuards();

    $response = $this->getJson('/api/auth/user');

    $response->assertStatus(401);
});

// ─── PUT /api/settings/profile ───

test('update profile changes name and email', function () {
    $response = $this->putJson('/api/settings/profile', [
        'name' => 'New Name',
        'email' => 'new@example.com',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.name', 'New Name')
        ->assertJsonPath('data.email', 'new@example.com');
});

test('update profile rejects duplicate email', function () {
    User::factory()->create(['email' => 'existing@example.com']);

    $response = $this->putJson('/api/settings/profile', [
        'name' => 'Test',
        'email' => 'existing@example.com',
    ]);

    $response->assertStatus(422);
});

test('update profile allows keeping same email', function () {
    $response = $this->putJson('/api/settings/profile', [
        'name' => 'Updated Name',
        'email' => $this->user->email,
    ]);

    $response->assertOk()
        ->assertJsonPath('data.email', $this->user->email);
});

// ─── PUT /api/settings/password ───

test('change password with correct old password', function () {
    $response = $this->putJson('/api/settings/password', [
        'old_password' => 'password',
        'password' => 'newpassword1',
        'password_confirmation' => 'newpassword1',
    ]);

    $response->assertOk();
});

test('change password rejects wrong old password', function () {
    $response = $this->putJson('/api/settings/password', [
        'old_password' => 'wrongpassword',
        'password' => 'newpassword1',
        'password_confirmation' => 'newpassword1',
    ]);

    $response->assertStatus(401);
});

test('change password requires confirmation match', function () {
    $response = $this->putJson('/api/settings/password', [
        'old_password' => 'password',
        'password' => 'newpassword1',
        'password_confirmation' => 'different',
    ]);

    $response->assertStatus(422);
});
