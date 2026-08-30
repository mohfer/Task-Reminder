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

        $hasSiakangCredentials = $settings?->hasSiakangCredentials() ?? false;

        return $this->sendResponse([
            'id' => $settings?->id,
            'deadline_notification' => $settings?->deadline_notification,
            'task_created_notification' => $settings?->task_created_notification,
            'task_completed_notification' => $settings?->task_completed_notification,
            'notification_channel' => $settings?->notification_channel,
            'telegram_chat_id' => $settings?->telegram_chat_id,
            'has_siakang_credentials' => $hasSiakangCredentials,
        ], 'Settings retrieved successfully');
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
        $message = 'Test notification sent to '.implode(' and ', $channelNames);

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

    public function siakangCredentials(Request $request)
    {
        $request->validate([
            'siakang_email' => 'required|email',
            'siakang_password' => 'required|string|min:1',
        ]);

        try {
            $setting = $this->settingsService->updateSiakangCredentials(
                $request->user()->id,
                $request->siakang_email,
                $request->siakang_password
            );
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 422);
        }

        return $this->sendResponse(
            ['has_siakang_credentials' => true],
            'Siakang credentials saved successfully'
        );
    }

    public function siakangCredentialsDelete(Request $request)
    {
        try {
            $setting = $this->settingsService->clearSiakangCredentials($request->user()->id);
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 422);
        }

        return $this->sendResponse(
            ['has_siakang_credentials' => false],
            'Siakang credentials removed successfully'
        );
    }
}
