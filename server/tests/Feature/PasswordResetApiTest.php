<?php

use App\Models\User;

// ─── POST /api/password/email ───

test('sendResetLink returns success message for known email', function () {
    $user = User::factory()->create();

    $response = $this->postJson('/api/password/email', [
        'email' => $user->email,
    ]);

    $response->assertOk()
        ->assertJsonPath('message', 'If that email is registered, we have sent a password reset link.');
});

test('sendResetLink returns same message for unknown email (prevent enumeration)', function () {
    $response = $this->postJson('/api/password/email', [
        'email' => 'unknown@example.com',
    ]);

    $response->assertOk()
        ->assertJsonPath('message', 'If that email is registered, we have sent a password reset link.');
});

test('sendResetLink validates email format', function () {
    $response = $this->postJson('/api/password/email', [
        'email' => 'not-an-email',
    ]);

    $response->assertStatus(422);
});

test('sendResetLink throttles rapid requests', function () {
    $user = User::factory()->create();

    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/password/email', ['email' => $user->email]);
    }

    $response = $this->postJson('/api/password/email', ['email' => $user->email]);

    $response->assertStatus(429);
});

// ─── POST /api/password/reset ───

test('resetPassword changes password with valid token', function () {
    $user = User::factory()->create(['password' => 'oldpassword']);
    $token = \Illuminate\Support\Facades\Password::createToken($user);

    $response = $this->postJson('/api/password/reset', [
        'email' => $user->email,
        'token' => $token,
        'password' => 'newpassword1',
        'password_confirmation' => 'newpassword1',
    ]);

    $response->assertOk()
        ->assertJsonPath('message', 'Password has been reset successfully.');

    expect(\Illuminate\Support\Facades\Hash::check('newpassword1', $user->fresh()->password))->toBeTrue();
});

test('resetPassword fails with invalid token', function () {
    $user = User::factory()->create();

    $response = $this->postJson('/api/password/reset', [
        'email' => $user->email,
        'token' => 'invalid-token-here',
        'password' => 'newpassword1',
        'password_confirmation' => 'newpassword1',
    ]);

    $response->assertStatus(400);
});

test('resetPassword validates required fields', function () {
    $response = $this->postJson('/api/password/reset', []);

    $response->assertStatus(422);
});
