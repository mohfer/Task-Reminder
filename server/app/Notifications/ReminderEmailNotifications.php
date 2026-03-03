<?php

namespace App\Notifications;

use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReminderEmailNotifications extends Notification implements ShouldQueue
{
    use Queueable;

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
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        usort($this->notifications, function ($a, $b) {
            return strtotime($a['deadline']) <=> strtotime($b['deadline']);
        });

        $formattedNotifications = array_map(function ($notification) {
            return [
                'course_content' => $notification['course_content'],
                'task' => $notification['task'],
                'description' => $notification['description'] ?? null,
                'deadline' => Carbon::parse($notification['deadline'])->format('j F Y'),
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
