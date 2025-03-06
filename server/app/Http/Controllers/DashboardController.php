<?php

namespace App\Http\Controllers;

use App\Models\CourseContent;
use App\Models\Task;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class DashboardController
{
    use ApiResponse;

    public function chart(Request $request)
    {
        $user = $request->user()->id;
        $semester = $request->semester;

        $courseContents = CourseContent::where('user_id', $user)
            ->where('semester', $semester)
            ->select(['course_content', 'id'])
            ->get();

        $data = [
            'semester' => $semester,
            'course_contents' => []
        ];

        foreach ($courseContents as $content) {
            $completedTask = Task::where('user_id', $user)
                ->where('course_content_id', $content->id)
                ->where('status', 1)
                ->count();

            $uncompletedTask = Task::where('user_id', $user)
                ->where('course_content_id', $content->id)
                ->where('status', 0)
                ->count();

            $totalTask = $completedTask + $uncompletedTask;

            $taskLists = Task::where('user_id', $user)
                ->where('course_content_id', $content->id)
                ->select('id', 'task', 'status', 'deadline', 'created_at', 'updated_at')
                ->get();

            $data['course_contents'][] = [
                'course_content' => $content->course_content,
                'completed_task' => $completedTask,
                'uncompleted_task' => $uncompletedTask,
                'total_task' => $totalTask,
                'tasks' => $taskLists
            ];
        }

        return $this->sendResponse($data, 'Chart retrieved successfully');
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
                    'deadline_label' => $task->deadline_label,
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
