<?php

namespace App\Notifications;

use Carbon\Carbon;
use App\Notifications\Concerns\ResolvesNotificationChannels;
use App\Services\TelegramService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable, ResolvesNotificationChannels;

    public $courseContent;
    public $task;
    public $deadline;
    /**
     * Create a new notification instance.
     */
    public function __construct($courseContent, $task, $deadline)
    {
        $this->courseContent = $courseContent;
        $this->task = $task;
        $this->deadline = $deadline;
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
        return app(TelegramService::class)->buildTaskCreatedMessage(
            $this->courseContent,
            $this->task,
            $this->deadline
        );
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Task Created Notification')
            ->view('emails.task-created', [
                'subject' => 'Task Created Notification',
                'userName' => $notifiable->name,
                'courseContent' => $this->courseContent,
                'task' => $this->task,
                'deadline' => Carbon::parse($this->deadline)->format('j F Y'),
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
