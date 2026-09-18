<?php

use App\Models\User;
use App\Notifications\ReminderNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('reminder toMail carries deadline label and badge color per item', function () {
    $user = User::factory()->create();

    $mail = (new ReminderNotification([
        ['task' => 'PR 1', 'course_content' => 'Kalkulus', 'deadline' => '2025-06-15', 'deadline_label' => '3 days left'],
        ['task' => 'PR 2', 'course_content' => 'Fisika', 'deadline' => '2025-06-20', 'deadline_label' => '1 day left'],
    ]))->toMail($user);

    $items = $mail->viewData['notifications'];

    expect($items[0]['deadline_label'])->toBe('3 days left')
        ->and($items[0]['deadline_color'])->toBe('#d97706')
        ->and($items[1]['deadline_label'])->toBe('1 day left')
        ->and($items[1]['deadline_color'])->toBe('#dc2626');
});

test('reminder toMail falls back to neutral color without label', function () {
    $user = User::factory()->create();

    $mail = (new ReminderNotification([
        ['task' => 'PR 1', 'course_content' => 'Kalkulus', 'deadline' => '2025-06-15'],
    ]))->toMail($user);

    $items = $mail->viewData['notifications'];

    expect($items[0]['deadline_label'])->toBeNull()
        ->and($items[0]['deadline_color'])->toBe('#64748b');
});

test('reminder toMail puts priority tasks first and flags them', function () {
    $user = User::factory()->create();

    $mail = (new ReminderNotification([
        ['task' => 'Later normal', 'course_content' => 'Kalkulus', 'deadline' => '2025-06-15', 'deadline_label' => '3 days left'],
        ['task' => 'Urgent priority', 'course_content' => 'Fisika', 'deadline' => '2025-06-20', 'deadline_label' => '8 days left', 'priority' => true],
    ]))->toMail($user);

    $items = $mail->viewData['notifications'];

    expect($items[0]['task'])->toBe('Urgent priority')
        ->and($items[0]['priority'])->toBeTrue()
        ->and($items[1]['task'])->toBe('Later normal')
        ->and($items[1]['priority'])->toBeFalse();
});

test('reminder email renders priority pill beside task', function () {
    $html = view('emails.task-reminder', [
        'subject' => 'Task Reminder Notification',
        'userName' => 'Tester',
        'count' => 1,
        'taskWord' => 'task',
        'notifications' => [
            [
                'course_content' => 'Kalkulus',
                'task' => 'Urgent priority',
                'deadline' => '20 June 2025',
                'deadline_label' => '8 days left',
                'deadline_color' => '#64748b',
                'priority' => true,
            ],
        ],
        'dashboardUrl' => 'http://localhost/dashboard',
    ])->render();

    expect($html)->toContain('Priority')
        ->and($html)->toContain('#dc2626')
        ->and($html)->toContain('8 days left');
});
