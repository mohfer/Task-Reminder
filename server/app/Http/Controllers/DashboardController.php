<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class DashboardController
{
    use ApiResponse;

    public function index(Request $request)
    {
        $user = $request->user()->id;

        $monthlyTask = Task::where('user_id', $user)
            // ->whereMonth('deadline', date('m'))
            // ->whereYear('deadline', date('Y'))
            ->count();

        $completedTask = Task::where('user_id', $user)
            ->where('status', 1)
            // ->whereMonth('deadline', date('m'))
            // ->whereYear('deadline', date('Y'))
            ->count();

        $uncompletedTask = Task::where('user_id', $user)
            ->where('status', 0)
            // ->whereMonth('deadline', date('m'))
            // ->whereYear('deadline', date('Y'))
            ->count();

        $tasks = Task::with('course_content')->where('user_id', $user)
            // ->whereMonth('deadline', date('m'))
            // ->whereYear('deadline', date('Y'))
            ->orderBy('deadline', 'ASC')
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'semester' => $task->course_content->semester ?? null,
                    'code' => $task->course_content->code ?? null,
                    'course_content_id' => $task->course_content->id ?? null,
                    'course_content' => $task->course_content->course_content ?? null,
                    'task' => $task->task,
                    'description' => $task->description,
                    'deadline' => $task->deadline,
                    'priority' => $task->priority,
                    'deadline_text' => $task->deadline_text,
                    'status' => $task->status,
                ];
            });

        $data = [
            'monthlyTask' => $monthlyTask,
            'completedTask' => $completedTask,
            'uncompletedTask' => $uncompletedTask,
            'tasks' => $tasks,
        ];


        return $this->sendResponse($data, 'Dashboard retrieved successfully');
    }

    public function filter(Request $request)
    {
        $user = $request->user()->id;

        $date = $request->date;

        $monthlyTask = Task::where('user_id', $user)
            ->whereMonth('deadline', date('m', strtotime($date)))
            ->whereYear('deadline', date('Y', strtotime($date)))
            ->count();

        $completedTask = Task::where('user_id', $user)
            ->where('status', 1)
            ->whereMonth('deadline', date('m', strtotime($date)))
            ->whereYear('deadline', date('Y', strtotime($date)))
            ->count();

        $uncompletedTask = Task::where('user_id', $user)
            ->where('status', 0)
            ->whereMonth('deadline', date('m', strtotime($date)))
            ->whereYear('deadline', date('Y', strtotime($date)))
            ->count();

        $tasks = Task::with('course_content')->where('user_id', $user)
            ->whereMonth('deadline', date('m', strtotime($date)))
            ->whereYear('deadline', date('Y', strtotime($date)))
            ->orderBy('deadline', 'ASC')
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'semester' => $task->course_content->semester ?? null,
                    'code' => $task->course_content->code ?? null,
                    'course_content_id' => $task->course_content->id ?? null,
                    'course_content' => $task->course_content->course_content ?? null,
                    'task' => $task->task,
                    'description' => $task->description,
                    'deadline' => $task->deadline,
                    'priority' => $task->priority,
                    'deadline_text' => $task->deadline_text,
                    'status' => $task->status,
                ];
            });

        $data = [
            'monthlyTask' => $monthlyTask,
            'completedTask' => $completedTask,
            'uncompletedTask' => $uncompletedTask,
            'tasks' => $tasks
        ];

        return $this->sendResponse($data, 'Dashboard retrieved successfully');
    }
}
