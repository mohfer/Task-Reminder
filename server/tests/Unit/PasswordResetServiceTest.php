<?php

use App\Models\User;
use App\Services\PasswordResetService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Password;

uses(Tests\TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->service = new PasswordResetService();
});

// ─── sendResetLink ───

test('sendResetLink returns status for known email', function () {
    $user = User::factory()->create();

    $status = $this->service->sendResetLink($user->email);

    expect($status)->toBe(Password::RESET_LINK_SENT);
});

test('sendResetLink returns error status for unknown email', function () {
    $status = $this->service->sendResetLink('unknown@example.com');

    expect($status)->toBe(Password::INVALID_USER);
});

// ─── resetPassword ───

test('resetPassword resets password with valid token', function () {
    $user = User::factory()->create();
    $token = Password::createToken($user);

    $status = $this->service->resetPassword([
        'email' => $user->email,
        'token' => $token,
        'password' => 'newpassword1',
        'password_confirmation' => 'newpassword1',
    ]);

    expect($status)->toBe(Password::PASSWORD_RESET);
    expect(\Illuminate\Support\Facades\Hash::check('newpassword1', $user->fresh()->password))->toBeTrue();
});

test('resetPassword fails with invalid token', function () {
    $user = User::factory()->create();

    $status = $this->service->resetPassword([
        'email' => $user->email,
        'token' => 'invalid-token',
        'password' => 'newpassword1',
        'password_confirmation' => 'newpassword1',
    ]);

    expect($status)->toBe(Password::INVALID_TOKEN);
});
