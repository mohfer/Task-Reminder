<?php

namespace App\Services;

use App\Models\Setting;
use App\Notifications\TestNotification;

class SettingsService
{
    public function __construct(
        private readonly TelegramService $telegramService
    ) {}

    public function getSettings(int $userId): ?Setting
    {
        return Setting::where('user_id', $userId)->first();
    }

    /**
     * @return array{channels: array<int, string>}
     */
    public function sendTestNotification(int $userId): array
    {
        $setting = $this->getOrFail($userId);
        $user = $setting->user;

        if (!$user) {
            throw new \Exception('User not found', 404);
        }

        $channels = [];

        if ($setting->wantsEmailChannel()) {
            $user->notify(new TestNotification());
            $channels[] = Setting::CHANNEL_EMAIL;
        }

        if ($setting->wantsTelegramChannel()) {
            if (!$setting->hasTelegramChatId()) {
                throw new \Exception('Please set Telegram chat ID first', 422);
            }

            $isSent = $this->telegramService->sendTestNotification(
                (string) $setting->telegram_chat_id,
                $setting->notification_channel
            );

            if (!$isSent) {
                throw new \Exception('Failed to send Telegram test notification', 502);
            }

            $channels[] = Setting::CHANNEL_TELEGRAM;
        }

        if ($channels === []) {
            throw new \Exception('No notification channel enabled', 422);
        }

        return ['channels' => $channels];
    }

    public function updateDeadlineNotification(int $userId, string $value): Setting
    {
        $setting = $this->getOrFail($userId);

        $setting->update([
            'deadline_notification' => $value,
        ]);

        return $setting;
    }

    public function updateNotificationChannel(int $userId, string $channel): Setting
    {
        $setting = $this->getOrFail($userId);
        $normalizedChannel = strtolower(trim($channel));

        if (!in_array($normalizedChannel, [Setting::CHANNEL_EMAIL, Setting::CHANNEL_TELEGRAM, Setting::CHANNEL_BOTH], true)) {
            throw new \Exception('Invalid notification channel', 422);
        }

        if (
            in_array($normalizedChannel, [Setting::CHANNEL_TELEGRAM, Setting::CHANNEL_BOTH], true)
            && !$setting->hasTelegramChatId()
        ) {
            throw new \Exception('Please set Telegram chat ID first', 422);
        }

        $setting->update([
            'notification_channel' => $normalizedChannel,
        ]);

        return $setting;
    }

    public function updateTelegramChatId(int $userId, ?string $chatId): Setting
    {
        $setting = $this->getOrFail($userId);
        $normalizedChatId = is_string($chatId) ? trim($chatId) : null;

        $setting->update([
            'telegram_chat_id' => $normalizedChatId !== '' ? $normalizedChatId : null,
        ]);

        if (!$setting->hasTelegramChatId() && $setting->notification_channel !== Setting::CHANNEL_EMAIL) {
            $setting->update([
                'notification_channel' => Setting::CHANNEL_EMAIL,
            ]);
        }

        return $setting;
    }

    public function toggleTaskCreatedNotification(int $userId): Setting
    {
        $setting = $this->getOrFail($userId);

        $setting->update([
            'task_created_notification' => $setting->task_created_notification == 1 ? 0 : 1,
        ]);

        return $setting;
    }

    public function toggleTaskCompletedNotification(int $userId): Setting
    {
        $setting = $this->getOrFail($userId);

        $setting->update([
            'task_completed_notification' => $setting->task_completed_notification == 1 ? 0 : 1,
        ]);

        return $setting;
    }

    private function getOrFail(int $userId): Setting
    {
        $setting = Setting::where('user_id', $userId)->first();

        if (!$setting) {
            throw new \Exception('Settings not found', 404);
        }

        return $setting;
    }
}
