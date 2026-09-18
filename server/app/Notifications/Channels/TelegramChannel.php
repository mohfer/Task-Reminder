<?php

namespace App\Notifications\Channels;

use App\Services\TelegramService;
use Illuminate\Notifications\Notification;

class TelegramChannel
{
    public function __construct(
        private readonly TelegramService $telegram
    ) {}

    /**
     * Send the given notification.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toTelegram')) {
            return;
        }

        $chatId = $notifiable->routeNotificationFor('telegram', $notification);

        if (! is_string($chatId) || trim($chatId) === '') {
            return;
        }

        $message = $notification->toTelegram($notifiable);

        if (! is_string($message) || $message === '') {
            return;
        }

        $this->telegram->sendMessage($chatId, $message);
    }
}
