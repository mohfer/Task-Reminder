<?php

namespace App\Http\Controllers;

use App\Models\CourseContent;
use App\Models\Task;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController
{
    use ApiResponse;

    public function index()
    {
        $tasks = Task::with('course_content')->where('user_id', Auth::user()->id)->orderBy('task', 'ASC')->get();
        return $this->sendResponse($tasks, 'Tasks retrieved successfully');
    }

    public function store(Request $request)
    {
        $user = Auth::user()->id;
        $courseContent = CourseContent::where('id', $request->course_content_id)->where('user_id', $user)->exists();

        $request->validate([
            'task' => 'required',
            'deadline' => 'required|date',
            'course_content_id' => 'required'
        ]);

        $request['status'] = 0;
        $request['user_id'] = $user;

        if (!$courseContent) {
            return $this->sendError('Course Content not found', 404);
        }

        $task = Task::create($request->all());

        return $this->sendResponse($task, 'Task created successfully', 201);
    }

    public function show($id)
    {
        $task = Task::with('course_content')->find($id);

        if (!$task) {
            return $this->sendError('Task not found', 404);
        }

        return $this->sendResponse($task, 'Task retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user()->id;

        $task = Task::find($id);

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

    public function destroy($id)
    {
        $task = Task::find($id);

        if (!$task) {
            return $this->sendError('Task not found', 404);
        }

        $task->delete();

        return $this->sendResponse(null, 'Task deleted successfully');
    }

    public function statusChanged(Request $request, $id)
    {
        $task = Task::find($id);

        if (!$task) {
            return $this->sendError('Task not found', 404);
        }

        if ($task->status == 1) {
            $request['status'] = 0;
        } else if ($task->status == 0) {
            $request['status'] = 1;
        }

        $task->update($request->all());

        return $this->sendResponse($task, 'Task status changed successfully');
    }
}
