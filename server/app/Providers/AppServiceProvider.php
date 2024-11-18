<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            $customUrl = str_replace(
                'http://localhost:8000/api',
                env('FRONTEND_URL') . '/auth',
                $url
            );

            return (new MailMessage)
                ->subject('Verify Email Address')
                ->line('Click the button below to verify your email address.')
                ->action('Verify Email Address', $customUrl);
        });

        ResetPassword::toMailUsing(function (object $notifiable, string $token) {
            $customUrl = env('FRONTEND_URL') . '/auth/forgot-password/reset?token=' . $token . '&email=' . urlencode($notifiable->email);

            return (new MailMessage)
                ->subject('Reset Password')
                ->line('Click the button below to reset your password.')
                ->action('Reset Password', $customUrl);
        });
    }
}
