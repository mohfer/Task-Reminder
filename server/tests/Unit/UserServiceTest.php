<?php

use App\Models\Setting;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use App\Services\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(Tests\TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->service = new UserService();
    $this->user = User::factory()->create();
});

// ─── updateProfile ───

test('updateProfile changes name and email', function () {
    $updated = $this->service->updateProfile($this->user, [
        'name' => 'New Name',
        'email' => 'new@example.com',
    ]);

    expect($updated->name)->toBe('New Name');
    expect($updated->email)->toBe('new@example.com');
});

test('updateProfile clears verification and notifies when email changes', function () {
    Notification::fake();
    $user = User::factory()->create(['email_verified_at' => now()]);

    $this->service->updateProfile($user, [
        'name' => $user->name,
        'email' => 'changed@example.com',
    ]);

    expect($user->fresh()->email_verified_at)->toBeNull();
    Notification::assertSentTo($user, VerifyEmailNotification::class);
});

test('updateProfile keeps verification when email is unchanged', function () {
    Notification::fake();

    $this->service->updateProfile($this->user, [
        'name' => 'Same Email',
        'email' => $this->user->email,
    ]);

    expect($this->user->fresh()->email_verified_at)->not->toBeNull();
    Notification::assertNothingSent();
});

// ─── changePassword ───

test('changePassword updates password when old password is correct', function () {
    $this->service->changePassword($this->user, 'password', 'newpassword1');

    expect(\Illuminate\Support\Facades\Hash::check('newpassword1', $this->user->fresh()->password))->toBeTrue();
});

test('changePassword throws when old password is wrong', function () {
    $this->service->changePassword($this->user, 'wrongpassword', 'newpassword1');
})->throws(\Exception::class, 'Current password is incorrect', 401);

// ─── getAuthenticatedUser ───

test('getAuthenticatedUser returns user data with settings', function () {
    Setting::create([
        'deadline_notification' => '5 days left',
        'task_created_notification' => 1,
        'task_completed_notification' => 1,
        'notification_channel' => Setting::CHANNEL_EMAIL,
        'telegram_chat_id' => null,
        'user_id' => $this->user->id,
    ]);

    $data = $this->service->getAuthenticatedUser($this->user);

    expect($data['user']['id'])->toBe($this->user->id);
    expect($data['user']['name'])->toBe($this->user->name);
    expect($data['user']['email'])->toBe($this->user->email);
    expect($data['settings'])->not->toBeNull();
});

test('getAuthenticatedUser returns null settings when none configured', function () {
    $data = $this->service->getAuthenticatedUser($this->user);

    expect($data['user']['id'])->toBe($this->user->id);
    expect($data['settings'])->toBeNull();
});
