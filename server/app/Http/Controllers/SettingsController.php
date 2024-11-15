<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SettingsController
{
    use ApiResponse;

    public function index()
    {
        $settings = Setting::where('user_id', Auth::user()->id)->get();

        return $this->sendResponse($settings, 'Settings retrieved successfully');
    }

    public function deadlineNotification(Request $request)
    {
        $setting = Setting::where('user_id', $request->user()->id)->first();
        $setting->deadline_notification = $request->deadline_notification;
        $setting->save();
        return $this->sendResponse($setting, 'Deadline notification updated successfully');
    }

    public function taskCreatedNotification(Request $request)
    {
        $setting = Setting::where('user_id', $request->user()->id)->first();

        if ($setting->task_created_notification == 1) {
            $request['task_created_notification'] = 0;
        } else if ($setting->task_created_notification == 0) {
            $request['task_created_notification'] = 1;
        }

        $setting->update($request->all());

        return $this->sendResponse($setting, 'Task created notification updated successfully');
    }

    public function taskCompletedNotification(Request $request)
    {
        $setting = Setting::where('user_id', $request->user()->id)->first();
        if ($setting->task_completed_notification == 1) {
            $request['task_completed_notification'] = 0;
        } else if ($setting->task_completed_notification == 0) {
            $request['task_completed_notification'] = 1;
        }

        $setting->update($request->all());

        return $this->sendResponse($setting, 'Task completed notification updated successfully');
    }
}
