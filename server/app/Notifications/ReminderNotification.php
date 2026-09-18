<?php

namespace App\Notifications;

use Carbon\Carbon;
use App\Models\Task;
use App\Notifications\Concerns\ResolvesNotificationChannels;
use App\Services\TelegramService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReminderNotification extends Notification implements ShouldQueue
{
    use Queueable, ResolvesNotificationChannels;

    public $notifications = [];
    /**
     * Create a new notification instance.
     */
    public function __construct($notifications)
    {
        $this->notifications = $notifications;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return self::channelsFor($notifiable);
    }

    /**
     * Get the Telegram representation of the notification.
     */
    public function toTelegram(object $notifiable): string
    {
        return app(TelegramService::class)->buildReminderSummaryMessage($this->notifications);
    }

    /**
     * Sort reminders with priority tasks first, then by nearest deadline.
     *
     * @param array<int, array<string, mixed>> $notifications
     * @return array<int, array<string, mixed>>
     */
    public static function sortByPriorityAndDeadline(array $notifications): array
    {
        usort($notifications, function (array $left, array $right) {
            $leftPriority = ! empty($left['priority']) ? 1 : 0;
            $rightPriority = ! empty($right['priority']) ? 1 : 0;

            if ($leftPriority !== $rightPriority) {
                return $rightPriority <=> $leftPriority;
            }

            return strtotime((string) ($left['deadline'] ?? '')) <=> strtotime((string) ($right['deadline'] ?? ''));
        });

        return $notifications;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $this->notifications = self::sortByPriorityAndDeadline($this->notifications);

        $formattedNotifications = array_map(function ($notification) {
            $label = $notification['deadline_label'] ?? null;

            return [
                'course_content' => $notification['course_content'],
                'task' => $notification['task'],
                'deadline' => Carbon::parse($notification['deadline'])->format('j F Y'),
                'deadline_label' => $label,
                'deadline_color' => Task::deadlineBadgeColor($label),
                'priority' => ! empty($notification['priority']),
            ];
        }, $this->notifications);

        $count = count($this->notifications);
        $taskWord = $count === 1 ? 'task' : 'tasks';

        return (new MailMessage)
            ->subject('Task Reminder Notification')
            ->view('emails.task-reminder', [
                'subject' => 'Task Reminder Notification',
                'userName' => $notifiable->name,
                'count' => $count,
                'taskWord' => $taskWord,
                'notifications' => $formattedNotifications,
                'dashboardUrl' => config('app.frontend_url') . '/dashboard',
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
