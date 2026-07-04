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

test('sendTaskCreated posts formatted message to telegram', function () {
    Http::fake([
        'api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    $this->service->sendTaskCreated('12345', 'Kalkulus', 'PR Bab 1', 'Kerjakan soal', '2025-06-15');

    Http::assertSent(function ($request) {
        return $request->url() === 'https://api.telegram.org/botdummy-token/sendMessage'
            && $request['chat_id'] === '12345'
            && str_contains($request['text'], 'Task Created Notification')
            && str_contains($request['text'], 'Kalkulus');
    });
});

test('sendTaskCreated omits description when null', function () {
    Http::fake([
        'api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    $this->service->sendTaskCreated('12345', 'Kalkulus', 'PR', null, '2025-06-15');

    Http::assertSent(function ($request) {
        return !str_contains($request['text'], 'Description:');
    });
});

test('sendTaskCompleted posts completed notification', function () {
    Http::fake([
        'api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    $this->service->sendTaskCompleted('12345', 'Fisika', 'Lab Report', 'Bab 1-3');

    Http::assertSent(function ($request) {
        return str_contains($request['text'], 'Task Completed Notification')
            && str_contains($request['text'], 'Fisika');
    });
});

test('sendReminderSummary posts multi-task reminder', function () {
    Http::fake([
        'api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    $notifications = [
        ['task' => 'PR 1', 'course_content' => 'Kalkulus', 'deadline' => '2025-06-15', 'description' => null],
        ['task' => 'PR 2', 'course_content' => 'Fisika', 'deadline' => '2025-06-20', 'description' => 'Penting'],
    ];

    $this->service->sendReminderSummary('12345', $notifications);

    Http::assertSent(function ($request) {
        return str_contains($request['text'], 'Reminder')
            && str_contains($request['text'], 'Kalkulus')
            && str_contains($request['text'], 'Fisika')
            && str_contains($request['text'], 'pending');
    });
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
