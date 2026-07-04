<?php

namespace App\Http\Controllers;

use App\Services\SettingsService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class SettingsController
{
    use ApiResponse;

    public function __construct(
        private readonly SettingsService $settingsService
    ) {}

    public function index(Request $request)
    {
        $settings = $this->settingsService->getSettings($request->user()->id);

        return $this->sendResponse($settings, 'Settings retrieved successfully');
    }

    public function deadlineNotification(Request $request)
    {
        $request->validate([
            'deadline_notification' => 'required|string',
        ]);

        try {
            $setting = $this->settingsService->updateDeadlineNotification($request->user()->id, $request->deadline_notification);
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 404);
        }

        return $this->sendResponse($setting, 'Deadline notification updated successfully');
    }

    public function notificationChannel(Request $request)
    {
        $request->validate([
            'notification_channel' => 'required|in:email,telegram,both',
        ]);

        try {
            $setting = $this->settingsService->updateNotificationChannel($request->user()->id, $request->notification_channel);
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 422);
        }

        return $this->sendResponse($setting, 'Notification channel updated successfully');
    }

    public function telegramChatId(Request $request)
    {
        $request->validate([
            'telegram_chat_id' => 'nullable|string|max:64',
        ]);

        try {
            $setting = $this->settingsService->updateTelegramChatId($request->user()->id, $request->input('telegram_chat_id'));
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 422);
        }

        return $this->sendResponse($setting, 'Telegram chat ID updated successfully');
    }

    public function testNotification(Request $request)
    {
        try {
            $result = $this->settingsService->sendTestNotification($request->user()->id);
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 422);
        }

        $channelNames = array_map('ucfirst', $result['channels']);
        $message = 'Test notification sent to ' . implode(' and ', $channelNames);

        return $this->sendResponse($result, $message);
    }

    public function taskCreatedNotification(Request $request)
    {
        try {
            $setting = $this->settingsService->toggleTaskCreatedNotification($request->user()->id);
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 404);
        }

        return $this->sendResponse($setting, 'Task created notification updated successfully');
    }

    public function taskCompletedNotification(Request $request)
    {
        try {
            $setting = $this->settingsService->toggleTaskCompletedNotification($request->user()->id);
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 404);
        }

        return $this->sendResponse($setting, 'Task completed notification updated successfully');
    }
}
