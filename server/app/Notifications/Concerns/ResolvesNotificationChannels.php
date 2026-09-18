<?php

namespace App\Notifications\Concerns;

use App\Models\Setting;
use App\Notifications\Channels\TelegramChannel;

trait ResolvesNotificationChannels
{
    /**
     * Resolve delivery channels from the user's notification settings.
     *
     * @return array<int, string>
     */
    public static function channelsFor(object $notifiable): array
    {
        $setting = Setting::where('user_id', $notifiable->getKey())->first();

        if (! $setting) {
            return ['mail'];
        }

        $channels = [];

        if ($setting->wantsEmailChannel()) {
            $channels[] = 'mail';
        }

        if ($setting->wantsTelegramChannel() && $setting->hasTelegramChatId()) {
            $channels[] = TelegramChannel::class;
        }

        return $channels;
    }
}
