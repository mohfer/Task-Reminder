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
