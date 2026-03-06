<?php

namespace App\Services;

use App\Models\CourseContent;
use App\Models\Grade;
use App\Models\Task;
use Carbon\Carbon;

class DashboardService
{
    public function getDashboard(int $userId): array
    {
        $taskCounts = Task::where('user_id', $userId)
            ->selectRaw('count(*) as totalTask, sum(status = 1) as completedTask, sum(status = 0) as uncompletedTask')
            ->first();

        $tasks = Task::with(['course_content' => function ($query) {
            $query->select('id', 'semester', 'code', 'course_content');
        }])
            ->where('user_id', $userId)
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

        return [
            'completed_task' => (int) $taskCounts->completedTask,
            'uncompleted_task' => (int) $taskCounts->uncompletedTask,
            'total_task' => $taskCounts->totalTask,
            'tasks' => $formattedTasks,
        ];
    }

    public function getChart(int $userId, string $semester): array
    {
        $courseContents = CourseContent::where('user_id', $userId)
            ->where('semester', $semester)
            ->with(['tasks' => function ($query) {
                $query->select('id', 'course_content_id', 'task', 'status', 'deadline', 'created_at', 'updated_at');
            }])
            ->select(['id', 'course_content'])
            ->orderBy('course_content', 'ASC')
            ->get();

        $totalCompleted = 0;
        $totalUncompleted = 0;
        $courseContentData = [];

        foreach ($courseContents as $content) {
            $completedTask = $content->tasks->where('status', 1)->count();
            $uncompletedTask = $content->tasks->where('status', 0)->count();
            $totalTask = $completedTask + $uncompletedTask;
            $totalCompleted += $completedTask;
            $totalUncompleted += $uncompletedTask;

            $formattedTasks = $content->tasks->map(function ($task) {
                return [
                    'id' => $task->id,
                    'course_content_id' => $task->course_content_id,
                    'task' => $task->task,
                    'status' => $task->status,
                    'deadline' => Carbon::parse($task->deadline)->format('j F Y'),
                    'created_at' => Carbon::parse($task->created_at)->format('j F Y'),
                    'updated_at' => Carbon::parse($task->updated_at)->format('j F Y'),
                    'deadline_label' => $task->deadline_label,
                ];
            });

            $courseContentData[] = [
                'id' => $content->id,
                'course_content' => $content->course_content,
                'completed_task' => $completedTask,
                'uncompleted_task' => $uncompletedTask,
                'total_task' => $totalTask,
                'tasks' => $formattedTasks,
            ];
        }

        return [
            'semester' => $semester,
            'course_contents' => $courseContentData,
            'completed_task' => $totalCompleted,
            'uncompleted_task' => $totalUncompleted,
            'total_task' => $totalCompleted + $totalUncompleted,
        ];
    }

    public function getSemesterOverview(int $userId): array
    {
        $grades = Grade::where('user_id', $userId)->get();

        $courseContents = CourseContent::where('user_id', $userId)
            ->with(['tasks' => function ($query) {
                $query->select('id', 'course_content_id', 'status');
            }])
            ->orderBy('course_content', 'ASC')
            ->get(['id', 'semester', 'credits', 'score']);

        if ($courseContents->isEmpty()) {
            return [
                'semesters' => [],
                'cumulative_gpa' => 0,
                'total_credits_all' => 0,
                'total_task_all' => 0,
                'completed_task_all' => 0,
                'uncompleted_task_all' => 0,
            ];
        }

        $groupedBySemester = $courseContents
            ->groupBy('semester')
            ->sortBy(fn($_, $semester) => $this->extractSemesterNumber($semester));

        $totalWeightedGradePointsAll = 0;
        $totalCreditsAll = 0;
        $totalTaskAll = 0;
        $completedTaskAll = 0;
        $uncompletedTaskAll = 0;
        $semesterRows = [];

        foreach ($groupedBySemester as $semester => $contents) {
            $totalCredits = (int) $contents->sum('credits');

            $completedTask = (int) $contents->sum(fn($content) => $content->tasks->where('status', 1)->count());
            $uncompletedTask = (int) $contents->sum(fn($content) => $content->tasks->where('status', 0)->count());
            $totalTask = $completedTask + $uncompletedTask;

            $mapped = $contents->map(function ($content) use ($grades) {
                $grade = null;

                if ($content->score !== null) {
                    $grade = $grades->first(fn($g) => $content->score >= $g->minimal_score && $content->score <= $g->maximal_score);
                }

                return [
                    'score' => $content->score,
                    'credits' => (int) $content->credits,
                    'grade_point' => (float) ($grade?->grade_point ?? 0),
                    'has_grade_mapping' => $grade !== null,
                ];
            });

            $hasIncompleteScores = $mapped->contains(fn($item) => $item['score'] === null || !$item['has_grade_mapping']);

            if (!$hasIncompleteScores && $mapped->isNotEmpty()) {
                $weightedGradePoints = $mapped->sum(fn($item) => $item['grade_point'] * $item['credits']);
                $semesterGpa = $totalCredits > 0 ? $weightedGradePoints / $totalCredits : 0;

                $totalWeightedGradePointsAll += $weightedGradePoints;
                $totalCreditsAll += $totalCredits;
            } else {
                $semesterGpa = 0;
            }

            $totalTaskAll += $totalTask;
            $completedTaskAll += $completedTask;
            $uncompletedTaskAll += $uncompletedTask;

            $semesterRows[] = [
                'semester' => $semester,
                'semester_gpa' => round($semesterGpa, 2),
                'total_credits' => $totalCredits,
                'total_task' => $totalTask,
                'completed_task' => $completedTask,
                'uncompleted_task' => $uncompletedTask,
                'has_complete_scores' => !$hasIncompleteScores,
            ];
        }

        $cumulativeGpa = $totalCreditsAll > 0 ? round($totalWeightedGradePointsAll / $totalCreditsAll, 2) : 0;

        return [
            'semesters' => array_values($semesterRows),
            'cumulative_gpa' => $cumulativeGpa,
            'total_credits_all' => (int) $totalCreditsAll,
            'total_task_all' => $totalTaskAll,
            'completed_task_all' => $completedTaskAll,
            'uncompleted_task_all' => $uncompletedTaskAll,
        ];
    }

    private function extractSemesterNumber(string $semester): int
    {
        if (preg_match('/(\d+)/', $semester, $matches)) {
            return (int) $matches[1];
        }

        return PHP_INT_MAX;
    }
}
