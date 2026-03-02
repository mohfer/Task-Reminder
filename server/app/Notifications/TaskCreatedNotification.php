<?php

namespace App\Notifications;

use Carbon\Carbon;
use App\Traits\FormatsNotificationDescription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable, FormatsNotificationDescription;

    public $courseContent;
    public $task;
    public $description;
    public $deadline;
    /**
     * Create a new notification instance.
     */
    public function __construct($courseContent, $task, $description, $deadline)
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
        $mailMessage = (new MailMessage)
            ->subject('Task Created Notification')
            ->line('You just created a new task. Here are the details:')
            ->line('---')
            ->line('Course Content: **' . $this->courseContent . '**.')
            ->line('Task: **' . $this->task . '**.');

        $mailMessage->line('Description:');
        $this->addDescriptionLines($mailMessage, $this->description);

        return $mailMessage
            ->line('Deadline: **' . Carbon::parse($this->deadline)->locale('id')->translatedFormat('j F Y') . '**.')
            ->action('View Dashboard', config('app.frontend_url') . '/dashboard')
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
