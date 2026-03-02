<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class SettingsController
{
    use ApiResponse;

    public function index(Request $request)
    {
        $user = $request->user()->id;

        $settings = Setting::where('user_id', $user)->first();

        return $this->sendResponse($settings, 'Settings retrieved successfully');
    }

    public function deadlineNotification(Request $request)
    {
        $request->validate([
            'deadline_notification' => 'required|string',
        ]);

        $setting = Setting::where('user_id', $request->user()->id)->first();
        $setting->update([
            'deadline_notification' => $request->deadline_notification,
        ]);
        return $this->sendResponse($setting, 'Deadline notification updated successfully');
    }

    public function taskCreatedNotification(Request $request)
    {
        $setting = Setting::where('user_id', $request->user()->id)->first();

        $setting->update([
            'task_created_notification' => $setting->task_created_notification == 1 ? 0 : 1,
        ]);

        return $this->sendResponse($setting, 'Task created notification updated successfully');
    }

    public function taskCompletedNotification(Request $request)
    {
        $setting = Setting::where('user_id', $request->user()->id)->first();
        $setting->update([
            'task_completed_notification' => $setting->task_completed_notification == 1 ? 0 : 1,
        ]);

        return $this->sendResponse($setting, 'Task completed notification updated successfully');
    }
}
