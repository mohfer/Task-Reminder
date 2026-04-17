<?php

namespace App\Services;

use App\Models\CourseContent;
use App\Models\Setting;
use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskCompletedNotification;
use App\Notifications\TaskCreatedNotification;
use App\Services\TelegramService;

class TaskService
{
    public function __construct(
        private readonly TelegramService $telegramService
    ) {}

    public function create(User $user, array $data): Task
    {
        $courseContent = CourseContent::where('id', $data['course_content_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        $task = Task::create([
            'task' => $data['task'],
            'description' => $data['description'] ?? null,
            'deadline' => $data['deadline'],
            'priority' => !empty($data['priority']) ? 1 : 0,
            'status' => 0,
            'user_id' => $user->id,
            'course_content_id' => $data['course_content_id'],
        ]);

        $settings = Setting::where('user_id', $user->id)->first();
        if ($settings && $settings->task_created_notification === 1) {
            if ($settings->wantsEmailChannel()) {
                $user->notify(new TaskCreatedNotification(
                    $courseContent->course_content,
                    $data['task'],
                    $data['description'] ?? null,
                    $data['deadline']
                ));
            }

            if ($settings->wantsTelegramChannel() && $settings->hasTelegramChatId()) {
                $this->telegramService->sendTaskCreated(
                    (string) $settings->telegram_chat_id,
                    $courseContent->course_content,
                    $data['task'],
                    $data['description'] ?? null,
                    $data['deadline']
                );
            }
        }

        return $task;
    }

    public function update(int $userId, int $taskId, array $data): Task
    {
        $task = Task::where('user_id', $userId)
            ->where('id', $taskId)
            ->firstOrFail();

        $task->update([
            'task' => $data['task'],
            'description' => $data['description'] ?? null,
            'deadline' => $data['deadline'],
            'priority' => !empty($data['priority']) ? 1 : 0,
            'course_content_id' => $data['course_content_id'],
        ]);

        return $task;
    }

    public function delete(int $userId, int $taskId): void
    {
        $task = Task::where('user_id', $userId)
            ->where('id', $taskId)
            ->firstOrFail();

        $task->delete();
    }

    public function toggleStatus(User $user, int $taskId): Task
    {
        $task = Task::with('course_content')
            ->where('id', $taskId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $settings = Setting::where('user_id', $user->id)->first();
        $newStatus = $task->status == 1 ? 0 : 1;

        if ($task->status == 0 && $newStatus == 1 && $settings && $settings->task_completed_notification === 1) {
            if ($settings->wantsEmailChannel()) {
                $user->notify(new TaskCompletedNotification($task));
            }

            if ($settings->wantsTelegramChannel() && $settings->hasTelegramChatId()) {
                $this->telegramService->sendTaskCompleted(
                    (string) $settings->telegram_chat_id,
                    $task->course_content->course_content,
                    $task->task,
                    $task->description
                );
            }
        }

        $task->update(['status' => $newStatus]);

        return $task;
    }
}
