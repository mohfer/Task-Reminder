<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $task;
    /**
     * Create a new notification instance.
     */
    public function __construct($task)
    {
        $this->task = $task;
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
        return (new MailMessage)
            ->subject('Task Completed Notification')
            ->line('You just completed a task. Here are the details:')
            ->line('---')
            ->line('Course Content: "**' . $this->task->course_content->course_content . '**".')
            ->line('Task "**' . $this->task->task . '**".')
            ->line('Description: "**' . $this->task->description . '**".')
            ->action('View Dashboard', env('FRONTEND_URL') . '/dashboard')
            ->line('Thank you for using our application! Don\'t forget to complete your other tasks!');
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
