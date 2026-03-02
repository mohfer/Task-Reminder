<?php

namespace App\Http\Controllers;

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

        $request->validate([
            'task' => 'required',
            'description' => 'nullable|string',
            'deadline' => 'required|date',
            'priority' => 'boolean',
            'course_content_id' => 'required|exists:course_contents,id'
        ]);

        $courseContent = CourseContent::where('id', $request->course_content_id)
            ->where('user_id', $user->id)
            ->first();


        if (!$courseContent) {
            return $this->sendError('Course Content not found', 404);
        }

        $task = Task::create([
            'task' => $request->task,
            'description' => $request->description,
            'deadline' => $request->deadline,
            'priority' => $request->boolean('priority') ? 1 : 0,
            'status' => 0,
            'user_id' => $user->id,
            'course_content_id' => $request->course_content_id,
        ]);

        $settings = Setting::where('user_id', $user->id)->first();
        if ($settings && $settings->task_created_notification === 1) {
            $user->notify(new TaskCreatedNotification(
                $courseContent->course_content,
                $request->task,
                $request->description,
                $request->deadline
            ));
        }

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

        $task->update([
            'task' => $request->task,
            'description' => $request->description,
            'deadline' => $request->deadline,
            'priority' => $request->boolean('priority') ? 1 : 0,
            'course_content_id' => $request->course_content_id,
        ]);

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

        $newStatus = $task->status == 1 ? 0 : 1;

        if ($task->status == 0 && $newStatus == 1 && $settings->task_completed_notification === 1) {
            $user->notify(new TaskCompletedNotification($task));
        }

        $task->update(['status' => $newStatus]);
        return $this->sendResponse($task, 'Task status changed successfully');
    }
}
