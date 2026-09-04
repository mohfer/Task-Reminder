<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSiakangCredentialsRequest;
use App\Http\Requests\UpdateDeadlineNotificationRequest;
use App\Http\Requests\UpdateNotificationChannelRequest;
use App\Http\Requests\UpdateTelegramChatIdRequest;
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

    public function deadlineNotification(UpdateDeadlineNotificationRequest $request)
    {
        try {
            $setting = $this->settingsService->updateDeadlineNotification($request->user()->id, $request->validated()['deadline_notification']);
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 404);
        }

        return $this->sendResponse($setting, 'Deadline notification updated successfully');
    }

    public function notificationChannel(UpdateNotificationChannelRequest $request)
    {
        try {
            $setting = $this->settingsService->updateNotificationChannel($request->user()->id, $request->validated()['notification_channel']);
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 422);
        }

        return $this->sendResponse($setting, 'Notification channel updated successfully');
    }

    public function telegramChatId(UpdateTelegramChatIdRequest $request)
    {
        try {
            $setting = $this->settingsService->updateTelegramChatId($request->user()->id, $request->validated()['telegram_chat_id'] ?? null);
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

    public function siakangCredentials(StoreSiakangCredentialsRequest $request)
    {
        try {
            $setting = $this->settingsService->updateSiakangCredentials(
                $request->user()->id,
                $request->validated()['siakang_email'],
                $request->validated()['siakang_password']
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
