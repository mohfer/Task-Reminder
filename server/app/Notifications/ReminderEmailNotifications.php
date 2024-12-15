<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReminderEmailNotifications extends Notification
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
        $mailMessage = (new MailMessage)
            ->subject('Task Reminder Notification')
            ->line('You have tasks to complete. Here are the details:');

        foreach ($this->notifications as $index => $notification) {
            $mailMessage->line('---')
                ->line('Task ' . ($index + 1) . ':')
                ->line('Course Content: **' . $notification['course_content'] . '**')
                ->line('Task: **' . $notification['task'] . '**')
                ->line('Description: **' . $notification['description'] . '**')
                ->line('Deadline: **' . $notification['deadline'] . '**');
        }

        $mailMessage->action('View Dashboard', env('FRONTEND_URL') . '/dashboard');
        $mailMessage->line('Thank you for using our application! Don\'t forget to complete your tasks!');

        return $mailMessage;
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
