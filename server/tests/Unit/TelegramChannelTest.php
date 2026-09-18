<?php

use App\Models\Setting;
use App\Models\User;
use App\Notifications\Channels\TelegramChannel;
use App\Notifications\ReminderNotification;
use App\Notifications\TaskCompletedNotification;
use App\Notifications\TaskCreatedNotification;
use App\Notifications\TestNotification;
use App\Services\TelegramService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\Notification;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->telegram = Mockery::mock(TelegramService::class);
    $this->channel = new TelegramChannel($this->telegram);
    $this->user = User::factory()->create();
    Setting::create([
        'deadline_notification' => '5 days left',
        'task_created_notification' => 1,
        'task_completed_notification' => 1,
        'notification_channel' => Setting::CHANNEL_EMAIL,
        'telegram_chat_id' => null,
        'user_id' => $this->user->id,
    ]);
});

// ─── TelegramChannel::send ───

test('telegram channel sends message when chat id is configured', function () {
    Setting::where('user_id', $this->user->id)->update([
        'notification_channel' => Setting::CHANNEL_TELEGRAM,
        'telegram_chat_id' => '12345',
    ]);

    $notification = new TaskCreatedNotification('Kalkulus', 'PR Bab 1', '2025-06-15');

    $this->telegram->shouldReceive('sendMessage')
        ->once()
        ->with('12345', Mockery::on(fn ($text) => str_contains($text, 'Kalkulus') && str_contains($text, 'See full task details')))
        ->andReturnTrue();

    $this->channel->send($this->user->fresh(), $notification);
});

test('telegram channel skips when user has no chat id', function () {
    $notification = new TaskCreatedNotification('Kalkulus', 'PR Bab 1', '2025-06-15');

    $this->telegram->shouldNotReceive('sendMessage');

    $this->channel->send($this->user->fresh(), $notification);
});

test('telegram channel skips notifications without toTelegram', function () {
    Setting::where('user_id', $this->user->id)->update([
        'notification_channel' => Setting::CHANNEL_TELEGRAM,
        'telegram_chat_id' => '12345',
    ]);

    $notification = new class extends Notification
    {
        public function via(object $notifiable): array
        {
            return [];
        }
    };

    $this->telegram->shouldNotReceive('sendMessage');

    $this->channel->send($this->user->fresh(), $notification);
});

// ─── channel routing ───

test('channels resolve to mail only for email setting', function () {
    expect(TaskCreatedNotification::channelsFor($this->user))->toBe(['mail']);
});

test('channels resolve to telegram only for telegram setting with chat id', function () {
    Setting::where('user_id', $this->user->id)->update([
        'notification_channel' => Setting::CHANNEL_TELEGRAM,
        'telegram_chat_id' => '12345',
    ]);

    expect(TaskCreatedNotification::channelsFor($this->user->fresh()))->toBe([TelegramChannel::class]);
});

test('channels resolve to both for both setting with chat id', function () {
    Setting::where('user_id', $this->user->id)->update([
        'notification_channel' => Setting::CHANNEL_BOTH,
        'telegram_chat_id' => '12345',
    ]);

    expect(TaskCreatedNotification::channelsFor($this->user->fresh()))->toBe(['mail', TelegramChannel::class]);
});

test('channels skip telegram when chat id is missing', function () {
    Setting::where('user_id', $this->user->id)->update([
        'notification_channel' => Setting::CHANNEL_TELEGRAM,
        'telegram_chat_id' => null,
    ]);

    expect(TaskCreatedNotification::channelsFor($this->user->fresh()))->toBe([]);
});

test('user routes telegram notifications to configured chat id', function () {
    expect($this->user->routeNotificationForTelegram(new TestNotification))->toBeNull();

    Setting::where('user_id', $this->user->id)->update([
        'notification_channel' => Setting::CHANNEL_BOTH,
        'telegram_chat_id' => '12345',
    ]);

    expect($this->user->fresh()->routeNotificationForTelegram(new TestNotification))->toBe('12345');
});

// ─── queue vs sync ───

test('non-test notifications are queued', function () {
    expect(new TaskCreatedNotification('C', 'T', '2025-06-15'))->toBeInstanceOf(ShouldQueue::class);
    expect(new ReminderNotification([]))->toBeInstanceOf(ShouldQueue::class);
});

test('test notification is sent synchronously', function () {
    expect(new TestNotification)->not->toBeInstanceOf(ShouldQueue::class);
});

// ─── telegram message content ───

test('task created telegram message contains course and task', function () {
    $message = (new TaskCreatedNotification('Kalkulus', 'PR Bab 1', '2025-06-15'))
        ->toTelegram($this->user);

    expect($message)->toContain('Kalkulus')
        ->and($message)->toContain('PR Bab 1')
        ->and($message)->toContain('See full task details')
        ->and($message)->not->toContain('Description:');
});

test('reminder telegram message summarizes notifications', function () {
    $message = (new ReminderNotification([
        ['task' => 'PR 1', 'course_content' => 'Kalkulus', 'deadline' => '15 June 2025', 'deadline_label' => '3 days left', 'description' => 'Long details that must stay on the dashboard'],
    ]))->toTelegram($this->user);

    expect($message)->toContain('Reminder')
        ->and($message)->toContain('Kalkulus')
        ->and($message)->toContain('\\(3 days left\\)')
        ->and($message)->not->toContain('Long details that must stay on the dashboard');
});

test('task completed telegram message contains task', function () {
    $course = \App\Models\CourseContent::create([
        'semester' => '2024/2025 Ganjil', 'code' => 'MK001', 'course_content' => 'Fisika',
        'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin',
        'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => $this->user->id,
    ]);

    $task = \App\Models\Task::create([
        'task' => 'Lab Report', 'description' => 'Details that must stay on the dashboard',
        'deadline' => '2025-01-01', 'status' => 0,
        'course_content_id' => $course->id, 'user_id' => $this->user->id,
    ]);
    $task->load('course_content');

    $message = (new TaskCompletedNotification($task))->toTelegram($this->user);

    expect($message)->toContain('Lab Report')
        ->and($message)->toContain('Fisika')
        ->and($message)->toContain('See full task details')
        ->and($message)->not->toContain('Details that must stay on the dashboard');
});
