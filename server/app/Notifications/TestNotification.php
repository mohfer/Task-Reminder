<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $baseUrl = trim((string) config('app.frontend_url'));

        if ($baseUrl === '') {
            $baseUrl = trim((string) config('app.url'));
        }

        $dashboardUrl = rtrim($baseUrl, '/') . '/dashboard';

        return (new MailMessage)
            ->subject('Test Notification')
            ->view('emails.test-notification', [
                'subject' => 'Test Notification',
                'userName' => $notifiable->name,
                'dashboardUrl' => $dashboardUrl,
            ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
