<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    public const CHANNEL_EMAIL = 'email';
    public const CHANNEL_TELEGRAM = 'telegram';
    public const CHANNEL_BOTH = 'both';

    protected $fillable = [
        'deadline_notification',
        'task_created_notification',
        'task_completed_notification',
        'notification_channel',
        'telegram_chat_id',
        'user_id',
    ];

    public $timestamps = false;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wantsEmailChannel(): bool
    {
        return in_array($this->notification_channel, [self::CHANNEL_EMAIL, self::CHANNEL_BOTH], true);
    }

    public function wantsTelegramChannel(): bool
    {
        return in_array($this->notification_channel, [self::CHANNEL_TELEGRAM, self::CHANNEL_BOTH], true);
    }

    public function hasTelegramChatId(): bool
    {
        return trim((string) $this->telegram_chat_id) !== '';
    }
}
