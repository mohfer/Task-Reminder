<?php

use App\Models\Setting;
use App\Models\User;
use App\Services\SettingsService;
use App\Services\TelegramService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->telegramService = Mockery::mock(TelegramService::class);
    $this->telegramService->shouldReceive('sendTestNotification')->byDefault();
    $this->service = new SettingsService($this->telegramService);
    $this->user = User::factory()->create();
    // Settings are created via AuthService::register — manually create here
    Setting::create([
        'deadline_notification' => '5 days left',
        'task_created_notification' => 1,
        'task_completed_notification' => 1,
        'notification_channel' => Setting::CHANNEL_EMAIL,
        'telegram_chat_id' => null,
        'user_id' => $this->user->id,
    ]);
});

// ─── getSettings ───

test('getSettings returns settings for user', function () {
    $settings = $this->service->getSettings($this->user->id);

    expect($settings)->not->toBeNull();
    expect($settings->notification_channel)->toBe(Setting::CHANNEL_EMAIL);
});

test('getSettings returns null for user without settings', function () {
    $otherUser = User::factory()->create();

    $settings = $this->service->getSettings($otherUser->id);

    expect($settings)->toBeNull();
});

// ─── sendTestNotification ───

test('sendTestNotification sends via email channel', function () {
    $result = $this->service->sendTestNotification($this->user->id);

    expect($result['channels'])->toContain(Setting::CHANNEL_EMAIL);
});

test('sendTestNotification throws when no channel enabled', function () {
    $setting = Setting::where('user_id', $this->user->id)->first();
    $setting->update(['notification_channel' => 'nonexistent']);

    $this->service->sendTestNotification($this->user->id);
})->throws(\Exception::class, 'No notification channel enabled');

test('sendTestNotification throws when telegram selected but no chat id', function () {
    $setting = Setting::where('user_id', $this->user->id)->first();
    $setting->update(['notification_channel' => Setting::CHANNEL_TELEGRAM]);

    $this->service->sendTestNotification($this->user->id);
})->throws(\Exception::class, 'Please set Telegram chat ID first');

// ─── updateDeadlineNotification ───

test('updateDeadlineNotification changes the value', function () {
    $setting = $this->service->updateDeadlineNotification($this->user->id, '3 days left');

    expect($setting->deadline_notification)->toBe('3 days left');
});

// ─── updateNotificationChannel ───

test('updateNotificationChannel sets valid channel', function () {
    $setting = Setting::where('user_id', $this->user->id)->first();
    $setting->update(['telegram_chat_id' => '123456', 'notification_channel' => Setting::CHANNEL_EMAIL]);

    $result = $this->service->updateNotificationChannel($this->user->id, Setting::CHANNEL_BOTH);

    expect($result->notification_channel)->toBe(Setting::CHANNEL_BOTH);
});

test('updateNotificationChannel rejects invalid channel', function () {
    $this->service->updateNotificationChannel($this->user->id, 'invalid');
})->throws(\Exception::class, 'Invalid notification channel');

test('updateNotificationChannel requires chat id for telegram channel', function () {
    $this->service->updateNotificationChannel($this->user->id, Setting::CHANNEL_TELEGRAM);
})->throws(\Exception::class, 'Please set Telegram chat ID first');

// ─── updateTelegramChatId ───

test('updateTelegramChatId sets chat id and rolls back channel if needed', function () {
    $setting = Setting::where('user_id', $this->user->id)->first();
    $setting->update(['notification_channel' => Setting::CHANNEL_BOTH, 'telegram_chat_id' => '123456']);

    // Clear chat id — should default back to email
    $result = $this->service->updateTelegramChatId($this->user->id, '');

    expect($result->telegram_chat_id)->toBeNull();
    expect($result->notification_channel)->toBe(Setting::CHANNEL_EMAIL);
});

test('updateTelegramChatId sets null when empty string', function () {
    $result = $this->service->updateTelegramChatId($this->user->id, '');

    expect($result->telegram_chat_id)->toBeNull();
});

test('updateTelegramChatId sets trimmed value', function () {
    $result = $this->service->updateTelegramChatId($this->user->id, ' 987654 ');

    expect($result->telegram_chat_id)->toBe('987654');
});

// ─── toggleTaskCreatedNotification ───

test('toggleTaskCreatedNotification flips from 1 to 0', function () {
    $result = $this->service->toggleTaskCreatedNotification($this->user->id);

    expect($result->task_created_notification)->toBe(0);
});

test('toggleTaskCreatedNotification flips back from 0 to 1', function () {
    Setting::where('user_id', $this->user->id)->update(['task_created_notification' => 0]);

    $result = $this->service->toggleTaskCreatedNotification($this->user->id);

    expect($result->task_created_notification)->toBe(1);
});

// ─── toggleTaskCompletedNotification ───

test('toggleTaskCompletedNotification flips from 1 to 0', function () {
    $result = $this->service->toggleTaskCompletedNotification($this->user->id);

    expect($result->task_completed_notification)->toBe(0);
});

// ─── Settings model helpers ───

test('wantsEmailChannel returns true for email and both', function () {
    $setting = Setting::where('user_id', $this->user->id)->first();

    $setting->update(['notification_channel' => Setting::CHANNEL_EMAIL]);
    expect($setting->fresh()->wantsEmailChannel())->toBeTrue();

    $setting->update(['notification_channel' => Setting::CHANNEL_BOTH]);
    expect($setting->fresh()->wantsEmailChannel())->toBeTrue();

    $setting->update(['notification_channel' => Setting::CHANNEL_TELEGRAM]);
    expect($setting->fresh()->wantsEmailChannel())->toBeFalse();
});

test('wantsTelegramChannel returns true for telegram and both', function () {
    $setting = Setting::where('user_id', $this->user->id)->first();

    $setting->update(['notification_channel' => Setting::CHANNEL_TELEGRAM]);
    expect($setting->fresh()->wantsTelegramChannel())->toBeTrue();

    $setting->update(['notification_channel' => Setting::CHANNEL_BOTH]);
    expect($setting->fresh()->wantsTelegramChannel())->toBeTrue();

    $setting->update(['notification_channel' => Setting::CHANNEL_EMAIL]);
    expect($setting->fresh()->wantsTelegramChannel())->toBeFalse();
});

test('hasTelegramChatId returns false for null or empty', function () {
    $setting = Setting::where('user_id', $this->user->id)->first();

    $setting->update(['telegram_chat_id' => null]);
    expect($setting->fresh()->hasTelegramChatId())->toBeFalse();

    $setting->update(['telegram_chat_id' => '']);
    expect($setting->fresh()->hasTelegramChatId())->toBeFalse();

    $setting->update(['telegram_chat_id' => '12345']);
    expect($setting->fresh()->hasTelegramChatId())->toBeTrue();
});
