<?php

namespace App\Services;

use Carbon\Carbon;
use App\Notifications\ReminderNotification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    public const DASHBOARD_HINT = 'See full task details on your dashboard.';

    public function buildTaskCreatedMessage(string $courseContent, string $task, string $deadline): string
    {
        $dashboardUrl = $this->getDashboardUrl();
        $message = [
            '*Task Created Notification*',
            '',
            '*Course:* ' . $this->escapeMarkdownV2($courseContent),
            '*Task:* ' . $this->escapeMarkdownV2($task),
            '*Deadline:* ' . $this->escapeMarkdownV2(Carbon::parse($deadline)->format('j F Y')),
            '',
            $this->escapeMarkdownV2(self::DASHBOARD_HINT),
            '',
            '[Open dashboard](' . $dashboardUrl . ')',
        ];

        return implode("\n", $message);
    }

    public function buildTaskCompletedMessage(string $courseContent, string $task): string
    {
        $dashboardUrl = $this->getDashboardUrl();
        $message = [
            '*Task Completed Notification*',
            '',
            '*Course:* ' . $this->escapeMarkdownV2($courseContent),
            '*Task:* ' . $this->escapeMarkdownV2($task),
            '',
            $this->escapeMarkdownV2(self::DASHBOARD_HINT),
            '',
            '[Open dashboard](' . $dashboardUrl . ')',
        ];

        return implode("\n", $message);
    }

    /**
     * @param array<int, array<string, mixed>> $notifications
     */
    public function buildReminderSummaryMessage(array $notifications): string
    {
        $dashboardUrl = $this->getDashboardUrl();

        $notifications = ReminderNotification::sortByPriorityAndDeadline($notifications);

        $count = count($notifications);
        $taskWord = $count === 1 ? 'task' : 'tasks';
        $message = [
            '*Task Reminder Notification*',
            '',
            'You have *' . $this->escapeMarkdownV2((string) $count) . '* pending ' . $this->escapeMarkdownV2($taskWord),
            '',
        ];

        foreach ($notifications as $index => $notification) {
            $message[] = '*Reminder ' . $this->escapeMarkdownV2((string) ($index + 1)) . '*';

            if (! empty($notification['priority'])) {
                $message[] = '*Priority*';
            }

            $message[] = '*Task:* ' . $this->escapeMarkdownV2((string) $notification['task']);
            $message[] = '*Course:* ' . $this->escapeMarkdownV2((string) $notification['course_content']);
            $message[] = '*Deadline:* ' . $this->escapeMarkdownV2($this->deadlineText($notification));
            $message[] = '';
        }

        $message[] = $this->escapeMarkdownV2(self::DASHBOARD_HINT);
        $message[] = '';
        $message[] = '[Open dashboard](' . $dashboardUrl . ')';

        return implode("\n", $message);
    }

    /**
     * @param array<string, mixed> $notification
     */
    private function deadlineText(array $notification): string
    {
        $text = Carbon::parse((string) $notification['deadline'])->format('j F Y');

        if (! empty($notification['deadline_label'])) {
            $text .= ' (' . $notification['deadline_label'] . ')';
        }

        return $text;
    }

    public function sendTestNotification(string $chatId, string $channel): bool
    {
        $dashboardUrl = $this->getDashboardUrl();
        $message = [
            '*Test Notification*',
            '',
            'This is a test notification from Task Reminder',
            '*Channel:* ' . $this->escapeMarkdownV2($channel),
            '*Status:* Telegram setup is working',
            '',
            '[Open dashboard](' . $dashboardUrl . ')',
        ];

        return $this->sendMessage($chatId, implode("\n", $message));
    }

    public function sendMessage(string $chatId, string $message, string $parseMode = 'MarkdownV2'): bool
    {
        $token = (string) config('services.telegram.bot_token');

        if ($token === '') {
            Log::warning('Telegram notification skipped because TELEGRAM_BOT_TOKEN is not configured.');
            return false;
        }

        try {
            $payload = [
                'chat_id' => $chatId,
                'text' => $message,
                'disable_web_page_preview' => true,
                'parse_mode' => $parseMode,
            ];

            $response = Http::timeout(10)
                ->asForm()
                ->post("https://api.telegram.org/bot{$token}/sendMessage", $payload);

            if ($response->failed()) {
                Log::warning('Failed to send Telegram notification.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return false;
            }

            return true;
        } catch (\Throwable $exception) {
            Log::warning('Telegram notification threw an exception.', [
                'error' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    private function getDashboardUrl(): string
    {
        $baseUrl = trim((string) config('app.frontend_url'));

        if ($baseUrl === '') {
            $baseUrl = trim((string) config('app.url'));
        }

        return rtrim($baseUrl, '/') . '/dashboard';
    }

    private function escapeMarkdownV2(string $value): string
    {
        $escaped = str_replace('\\', '\\\\', $value);

        return str_replace(
            ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'],
            ['\\_', '\\*', '\\[', '\\]', '\\(', '\\)', '\\~', '\\`', '\\>', '\\#', '\\+', '\\-', '\\=', '\\|', '\\{', '\\}', '\\.', '\\!'],
            $escaped
        );
    }
}
