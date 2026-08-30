<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    use HasFactory;

    public const CHANNEL_EMAIL = 'email';

    public const CHANNEL_TELEGRAM = 'telegram';

    public const CHANNEL_BOTH = 'both';

    protected $fillable = [
        'deadline_notification',
        'task_created_notification',
        'task_completed_notification',
        'notification_channel',
        'telegram_chat_id',
        'siakang_email',
        'siakang_password',
        'user_id',
    ];

    public $timestamps = false;

    protected $hidden = [
        'siakang_email',
        'siakang_password',
    ];

    protected function casts(): array
    {
        return [
            'siakang_email' => 'encrypted',
            'siakang_password' => 'encrypted',
        ];
    }

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

    public function hasSiakangCredentials(): bool
    {
        return trim((string) $this->siakang_email) !== ''
            && trim((string) $this->siakang_password) !== '';
    }
}
