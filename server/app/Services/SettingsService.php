<?php

namespace App\Services;

use App\Models\Setting;

class SettingsService
{
    public function getSettings(int $userId): ?Setting
    {
        return Setting::where('user_id', $userId)->first();
    }

    public function updateDeadlineNotification(int $userId, string $value): Setting
    {
        $setting = $this->getOrFail($userId);

        $setting->update([
            'deadline_notification' => $value,
        ]);

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
