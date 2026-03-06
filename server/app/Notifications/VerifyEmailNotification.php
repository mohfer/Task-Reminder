<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmailNotification extends VerifyEmail implements ShouldQueue
{
    use Queueable;

    public function toMail($notifiable): MailMessage
    {
        $url = $this->verificationUrl($notifiable);

        $customUrl = str_replace(
            config('app.url') . '/api',
            config('app.frontend_url') . '/auth',
            $url
        );

        return (new MailMessage)
            ->subject('Verify Email Address')
            ->view('emails.verify-email', [
                'subject' => 'Verify Email Address',
                'userName' => $notifiable->name,
                'verificationUrl' => $customUrl,
            ]);
    }
}
