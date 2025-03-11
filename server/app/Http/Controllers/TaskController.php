<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Task;
use App\Models\Setting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Models\CourseContent;
use App\Notifications\TaskCompletedNotification;
use App\Notifications\TaskCreatedNotification;

class TaskController
{
    use ApiResponse;

    public function store(Request $request)
    {
        $user = $request->user();
        $courseContent = CourseContent::where('id', $request->course_content_id)->where('user_id', $user->id)->first();
        $settings = Setting::where('user_id', $user->id)->first();
        $deadline = Carbon::parse($request->deadline)->format('j F Y');

        $request->validate([
            'task' => 'required',
            'deadline' => 'required|date',
            'priority' => 'boolean',
            'course_content_id' => 'required'
        ]);

        $request['priority'] == true ? 1 : 0;
        $request['status'] = 0;
        $request['user_id'] = $user->id;

        if (!$courseContent) {
            return $this->sendError('Course Content not found', 404);
        }


        if ($settings->task_created_notification === 1) {
            $user->notify(new TaskCreatedNotification($courseContent->course_content, $request['task'], $request['description'], $deadline));
        }

        $task = Task::create($request->all());

        return $this->sendResponse($task, 'Task created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user()->id;

        $task = Task::where('user_id', $user)->where('id', $id)->first();

        if (!$task) {
            return $this->sendError('Task not found', 404);
        }

        $request->validate([
            'task' => 'required',
            'deadline' => 'required|date',
            'course_content_id' => 'required'
        ]);

        $request['user_id'] = $user;

        $task->update($request->all());

        return $this->sendResponse($task, 'Task updated successfully');
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user()->id;

        $task = Task::where('user_id', $user)->where('id', $id)->first();

        if (!$task) {
            return $this->sendError('Task not found', 404);
        }

        $task->delete();

        return $this->sendResponse(null, 'Task deleted successfully');
    }

    public function statusChanged(Request $request, $id)
    {
        $task = Task::with('course_content')->where('id', $id)->where('user_id', $request->user()->id)->first();
        $settings = Setting::where('user_id', $request->user()->id)->first();
        $user = $request->user();

        if (!$task) {
            return $this->sendError('Task not found', 404);
        }

        $request['status'] = $task->status == 1 ? 0 : 1;

        if ($task->status == 0 && $request['status'] == 1 && $settings->task_completed_notification === 1) {
            $user->notify(new TaskCompletedNotification($task));
        }

        $task->update($request->all());
        return $this->sendResponse($task, 'Task status changed successfully');
    }
}
