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
        $mailMessage = (new MailMessage)
            ->subject('Task Completed Notification')
            ->line('You just completed a task. Here are the details:')
            ->line('---')
            ->line('Course Content: **' . $this->task->course_content->course_content . '**.')
            ->line('Task: **' . $this->task->task . '**.');

        $mailMessage->line('Description:');
        $this->addDescriptionLines($mailMessage, $this->task->description);

        return $mailMessage
            ->action('View Dashboard', env('FRONTEND_URL') . '/dashboard')
            ->line('Thank you for using our application! Don\'t forget to complete your other tasks!');
    }

    /**
     * Add description lines with proper formatting
     */
    private function addDescriptionLines($mailMessage, $description)
    {
        $lines = preg_split('/\r\n|\r|\n/', $description);

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed !== '') {
                if (str_starts_with($trimmed, '-')) {
                    $mailMessage->line('**' . $trimmed . '**');
                } else {
                    $mailMessage->line($trimmed);
                }
            }
        }
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
