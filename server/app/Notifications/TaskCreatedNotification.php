<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskCreatedNotification extends Notification
{
    use Queueable;

    public $courseContent;
    public $task;
    public $description;
    public $deadline;
    /**
     * Create a new notification instance.
     */
    public function __construct($courseContent, $task, $description,$deadline)
    {
        $this->courseContent = $courseContent;
        $this->task = $task;
        $this->description = $description;
        $this->deadline = $deadline;
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
            ->subject('Task Created Notification')
            ->line('You just created a new task. Here are the details:')
            ->line('---')
            ->line('Course Content: "**' . $this->courseContent . '**".')
            ->line('Task: "**' . $this->task . '**".')
            ->line('Description: "**' . $this->description . '**".')
            ->line('Deadline: "**' . $this->deadline . '**".')
            ->action('View Dashboard', env('FRONTEND_URL') . '/dashboard')
            ->line('Thank you for using our application! Don\'t forget to complete your tasks!');
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
