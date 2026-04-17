<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    public function sendTaskCreated(string $chatId, string $courseContent, string $task, ?string $description, string $deadline): void
    {
        $dashboardUrl = $this->getDashboardUrl();
        $message = [
            '*Task Created Notification*',
            '',
            '*Course:* ' . $this->escapeMarkdownV2($courseContent),
            '*Task:* ' . $this->escapeMarkdownV2($task),
            '*Deadline:* ' . $this->escapeMarkdownV2(Carbon::parse($deadline)->format('j F Y')),
        ];

        $this->appendDescriptionMarkdown($message, $description);
        $message[] = '';
        $message[] = '[Open dashboard](' . $dashboardUrl . ')';

        $this->sendMessage($chatId, implode("\n", $message));
    }

    public function sendTaskCompleted(string $chatId, string $courseContent, string $task, ?string $description): void
    {
        $dashboardUrl = $this->getDashboardUrl();
        $message = [
            '*Task Completed Notification*',
            '',
            '*Course:* ' . $this->escapeMarkdownV2($courseContent),
            '*Task:* ' . $this->escapeMarkdownV2($task),
        ];

        $this->appendDescriptionMarkdown($message, $description);
        $message[] = '';
        $message[] = '[Open dashboard](' . $dashboardUrl . ')';

        $this->sendMessage($chatId, implode("\n", $message));
    }

    /**
     * @param array<int, array<string, mixed>> $notifications
     */
    public function sendReminderSummary(string $chatId, array $notifications): void
    {
        $dashboardUrl = $this->getDashboardUrl();

        usort($notifications, function (array $left, array $right) {
            return strtotime((string) $left['deadline']) <=> strtotime((string) $right['deadline']);
        });

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
            $message[] = '*Task:* ' . $this->escapeMarkdownV2((string) $notification['task']);
            $message[] = '*Course:* ' . $this->escapeMarkdownV2((string) $notification['course_content']);
            $message[] = '*Deadline:* ' . $this->escapeMarkdownV2(Carbon::parse((string) $notification['deadline'])->format('j F Y'));

            if (!empty($notification['description'])) {
                $message[] = '*Description:*';
                $lines = preg_split('/\r\n|\r|\n/', (string) $notification['description']) ?: [];
                foreach ($lines as $line) {
                    $trimmed = trim((string) $line);
                    if ($trimmed !== '') {
                        $message[] = '\\- ' . $this->escapeMarkdownV2($trimmed);
                    }
                }
            }

            $message[] = '';
        }

        $message[] = '[Open dashboard](' . $dashboardUrl . ')';

        $this->sendMessage($chatId, implode("\n", $message));
    }

    public function sendTestNotification(string $chatId, string $channel): bool
    {
        $dashboardUrl = $this->getDashboardUrl();
        $message = [
            '*Test Notification*',
            '',
            'This is a dummy notification from Task Reminder',
            '*Channel:* ' . $this->escapeMarkdownV2($channel),
            '*Status:* Telegram setup is working',
            '',
            '[Open dashboard](' . $dashboardUrl . ')',
        ];

        return $this->sendMessage($chatId, implode("\n", $message));
    }

    private function sendMessage(string $chatId, string $message, string $parseMode = 'MarkdownV2'): bool
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

    /**
     * @param array<int, string> $message
     */
    private function appendDescriptionMarkdown(array &$message, ?string $description): void
    {
        if (!$description) {
            return;
        }

        $message[] = '*Description:*';
        $lines = preg_split('/\r\n|\r|\n/', $description) ?: [];

        foreach ($lines as $line) {
            $trimmed = trim((string) $line);
            if ($trimmed !== '') {
                $message[] = '\\- ' . $this->escapeMarkdownV2($trimmed);
            }
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
