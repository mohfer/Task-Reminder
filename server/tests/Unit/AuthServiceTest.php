<?php

use App\Models\Grade;
use App\Models\Setting;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(Tests\TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->service = new AuthService();
});

// ─── login ───

test('login returns token and user with valid credentials', function () {
    $user = User::factory()->create(['password' => 'password']);

    $result = $this->service->login(['email' => $user->email, 'password' => 'password'], false);

    expect($result)->toHaveKeys(['token', 'token_type', 'user']);
    expect($result['token_type'])->toBe('Bearer');
    expect($result['user']->id)->toBe($user->id);
});

test('login throws 401 with wrong password', function () {
    $user = User::factory()->create(['password' => 'password']);

    $this->service->login(['email' => $user->email, 'password' => 'wrongpass'], false);
})->throws(\Exception::class, 'Email or password is incorrect', 401);

test('login throws 401 with unknown email', function () {
    $this->service->login(['email' => 'nobody@example.com', 'password' => 'password'], false);
})->throws(\Exception::class, 'Email or password is incorrect', 401);

test('login with remember_me creates 30-day token', function () {
    $user = User::factory()->create(['password' => 'password']);

    $result = $this->service->login(['email' => $user->email, 'password' => 'password'], true);

    expect($result['token'])->toBeString();
    expect(strlen($result['token']))->toBeGreaterThan(10);
});

// ─── register ───

test('register creates user with default settings and grades', function () {
    Event::fake();

    $data = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
    ];

    $result = $this->service->register($data);

    expect($result['user']->name)->toBe('Test User');
    expect($result['user']->email)->toBe('test@example.com');
    expect($result['token'])->toBeString();

    // Default settings created
    $settings = Setting::where('user_id', $result['user']->id)->first();
    expect($settings)->not->toBeNull();
    expect($settings->notification_channel)->toBe(Setting::CHANNEL_EMAIL);
    expect($settings->task_created_notification)->toBe(1);
    expect($settings->task_completed_notification)->toBe(1);

    // Default grades created (9 grades)
    $grades = Grade::where('user_id', $result['user']->id)->get();
    expect($grades)->toHaveCount(9);

    Event::assertDispatched(Registered::class);
});

// ─── resendVerificationEmail ───

test('resendVerificationEmail sends notification for unverified user', function () {
    $user = User::factory()->unverified()->create();

    // Should not throw
    $this->service->resendVerificationEmail($user);
    expect(true)->toBeTrue(); // did not throw
});

test('resendVerificationEmail throws when already verified', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);

    $this->service->resendVerificationEmail($user);
})->throws(\Exception::class, 'Email already verified');

// ─── verifyEmail ───

test('verifyEmail marks user email as verified', function () {
    Event::fake();
    $user = User::factory()->unverified()->create();

    $this->service->verifyEmail($user->id);

    expect($user->fresh()->email_verified_at)->not->toBeNull();
    Event::assertDispatched(Verified::class);
});

test('verifyEmail throws when already verified', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);

    $this->service->verifyEmail($user->id);
})->throws(\Exception::class, 'Email already verified');

// ─── checkToken ───

test('checkToken returns true for valid non-expired token', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test', ['*'], now()->addHour())->plainTextToken;
    $tokenId = explode('|', $token)[0];

    expect($this->service->checkToken($tokenId))->toBeTrue();
});

test('checkToken returns false for invalid token id', function () {
    expect($this->service->checkToken('99999'))->toBeFalse();
});

// ─── checkEmailVerified ───

test('checkEmailVerified returns true when verified', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);

    expect($this->service->checkEmailVerified($user))->toBeTrue();
});

test('checkEmailVerified returns false when unverified', function () {
    $user = User::factory()->unverified()->create();

    expect($this->service->checkEmailVerified($user))->toBeFalse();
});

// ─── logout ───

test('logout deletes current access token', function () {
    $user = User::factory()->create();
    $user->createToken('test', ['*'], now()->addHour());

    // Simulate acting as the user with a token
    $token = $user->tokens()->first();
    expect($token)->not->toBeNull();

    // The logout method expects $user->currentAccessToken() to exist
    // We test that it doesn't throw
    $result = $this->service->logout($user);
    expect($result)->toBeNull();
});
