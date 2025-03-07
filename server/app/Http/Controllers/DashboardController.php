<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Helpers\DateHelper;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Models\CourseContent;

class DashboardController
{
    use ApiResponse;

    public function index(Request $request)
    {
        $user = $request->user()->id;

        $taskCounts = Task::where('user_id', $user)
            ->selectRaw('count(*) as totalTask, sum(status = 1) as completedTask, sum(status = 0) as uncompletedTask')
            ->first();

        $tasks = Task::with(['course_content' => function ($query) {
            $query->select('id', 'semester', 'code', 'course_content');
        }])
            ->where('user_id', $user)
            ->orderBy('deadline', 'ASC')
            ->get(['id', 'course_content_id', 'task', 'description', 'deadline', 'priority', 'status']);

        $formattedTasks = $tasks->map(function ($task) {
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
            'completed_task' => (int) $taskCounts->completedTask,
            'uncompleted_task' => (int) $taskCounts->uncompletedTask,
            'total_task' => $taskCounts->totalTask,
            'tasks' => $formattedTasks,
        ];

        return $this->sendResponse($data, 'Dashboard retrieved successfully');
    }

    public function chart(Request $request)
    {
        $user = $request->user()->id;
        $semester = $request->semester;

        $tasks = Task::whereHas('course_content', function ($query) use ($user, $semester) {
            $query->where('user_id', $user)
                ->where('semester', $semester);
        })
            ->selectRaw('count(*) as total, sum(status = 1) as completed, sum(status = 0) as uncompleted')
            ->first();

        $completedTask = $tasks->completed;
        $uncompletedTask = $tasks->uncompleted;
        $totalTask = $tasks->total;

        $courseContents = CourseContent::where('user_id', $user)
            ->where('semester', $semester)
            ->with(['tasks' => function ($query) {
                $query->select('id', 'course_content_id', 'task', 'status', 'deadline', 'created_at', 'updated_at');
            }])
            ->select(['id', 'course_content'])
            ->get();

        $data = [
            'semester' => $semester,
            'completed_task' => (int) $completedTask,
            'uncompleted_task' => (int) $uncompletedTask,
            'total_task' => $totalTask,
            'course_contents' => []
        ];

        foreach ($courseContents as $content) {
            $completedTask = $content->tasks->where('status', 1)->count();
            $uncompletedTask = $content->tasks->where('status', 0)->count();
            $totalTask = $completedTask + $uncompletedTask;

            $formattedTasks = $content->tasks->map(function ($task) {
                return [
                    'id' => $task->id,
                    'course_content_id' => $task->course_content_id,
                    'task' => $task->task,
                    'status' => $task->status,
                    'deadline' => DateHelper::formatIndonesianDate($task->deadline),
                    'created_at' => $task->created_at,
                    'updated_at' => $task->updated_at,
                    'deadline_label' => $task->deadline_label
                ];
            });

            $data['course_contents'][] = [
                'id' => $content->id,
                'course_content' => $content->course_content,
                'completed_task' => $completedTask,
                'uncompleted_task' => $uncompletedTask,
                'total_task' => $totalTask,
                'tasks' => $formattedTasks
            ];
        }

        return $this->sendResponse($data, 'Chart retrieved successfully');
    }
}
