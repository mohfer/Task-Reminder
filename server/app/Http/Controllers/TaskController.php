<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Services\TaskService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class TaskController
{
    use ApiResponse;

    public function __construct(
        private readonly TaskService $taskService
    ) {}

    public function store(StoreTaskRequest $request)
    {
        try {
            $task = $this->taskService->create($request->user(), $request->validated());
        } catch (\Exception) {
            return $this->sendError('Course Content not found', 404);
        }

        return $this->sendResponse($task, 'Task created successfully', 201);
    }

    public function update(UpdateTaskRequest $request, $id)
    {
        try {
            $task = $this->taskService->update($request->user()->id, (int) $id, $request->validated());
        } catch (\Exception) {
            return $this->sendError('Task not found', 404);
        }

        return $this->sendResponse($task, 'Task updated successfully');
    }

    public function destroy(Request $request, $id)
    {
        try {
            $this->taskService->delete($request->user()->id, (int) $id);
        } catch (\Exception) {
            return $this->sendError('Task not found', 404);
        }

        return $this->sendResponse(null, 'Task deleted successfully');
    }

    public function statusChanged(Request $request, $id)
    {
        try {
            $task = $this->taskService->toggleStatus($request->user(), (int) $id);
        } catch (\Exception) {
            return $this->sendError('Task not found', 404);
        }

        return $this->sendResponse($task, 'Task status changed successfully');
    }
}
