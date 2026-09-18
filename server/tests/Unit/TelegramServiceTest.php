<?php

use App\Services\TelegramService;
use Illuminate\Support\Facades\Http;

uses(Tests\TestCase::class);

beforeEach(function () {
    config()->set('services.telegram.bot_token', 'dummy-token');
    config()->set('app.frontend_url', 'http://localhost:3000');
    $this->service = new TelegramService();
});

// ─── sendMessage (via public methods) ───

test('buildTaskCreatedMessage posts formatted message to telegram', function () {
    $text = $this->service->buildTaskCreatedMessage('Kalkulus', 'PR Bab 1', '2025-06-15');

    expect($text)->toContain('Task Created Notification')
        ->and($text)->toContain('Kalkulus')
        ->and($text)->toContain('See full task details');
});

test('buildTaskCreatedMessage excludes description', function () {
    $text = $this->service->buildTaskCreatedMessage('Kalkulus', 'PR', '2025-06-15');

    expect($text)->not->toContain('Description:');
});

test('buildTaskCompletedMessage posts completed notification without description', function () {
    $text = $this->service->buildTaskCompletedMessage('Fisika', 'Lab Report');

    expect($text)->toContain('Task Completed Notification')
        ->and($text)->toContain('Fisika')
        ->and($text)->toContain('See full task details')
        ->and($text)->not->toContain('Description:');
});

test('buildReminderSummaryMessage puts priority tasks first with marker', function () {
    $notifications = [
        ['task' => 'Later normal', 'course_content' => 'Kalkulus', 'deadline' => '2025-06-15', 'deadline_label' => '3 days left'],
        ['task' => 'Urgent priority', 'course_content' => 'Fisika', 'deadline' => '2025-06-20', 'deadline_label' => '8 days left', 'priority' => true],
    ];

    $text = $this->service->buildReminderSummaryMessage($notifications);

    expect($text)->toContain('*Priority*')
        ->and(strpos($text, 'Urgent priority'))->toBeLessThan(strpos($text, 'Later normal'));
});

test('buildReminderSummaryMessage posts multi-task reminder without descriptions', function () {
    $notifications = [
        ['task' => 'PR 1', 'course_content' => 'Kalkulus', 'deadline' => '2025-06-15', 'deadline_label' => '3 days left', 'description' => 'Very long details that should not appear'],
        ['task' => 'PR 2', 'course_content' => 'Fisika', 'deadline' => '2025-06-20', 'deadline_label' => '1 day left', 'description' => 'Penting'],
    ];

    $text = $this->service->buildReminderSummaryMessage($notifications);

    expect($text)->toContain('Reminder')
        ->and($text)->toContain('Kalkulus')
        ->and($text)->toContain('Fisika')
        ->and($text)->toContain('pending')
        ->and($text)->toContain('See full task details')
        ->and($text)->toContain('\\(3 days left\\)')
        ->and($text)->toContain('\\(1 day left\\)')
        ->and($text)->not->toContain('Very long details that should not appear')
        ->and($text)->not->toContain('Description:');
});

test('sendTestNotification returns true on success', function () {
    Http::fake([
        'api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    $result = $this->service->sendTestNotification('12345', 'telegram');

    expect($result)->toBeTrue();
});

test('sendTestNotification returns false on api failure', function () {
    Http::fake([
        'api.telegram.org/*' => Http::response(['ok' => false], 400),
    ]);

    $result = $this->service->sendTestNotification('12345', 'telegram');

    expect($result)->toBeFalse();
});

test('sendMessage returns false when bot token not configured', function () {
    config()->set('services.telegram.bot_token', '');

    $result = $this->service->sendTestNotification('12345', 'telegram');

    expect($result)->toBeFalse();
});
