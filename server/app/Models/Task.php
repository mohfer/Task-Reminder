<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $appends = ['deadline_label'];

    protected $fillable = [
        'task',
        'description',
        'deadline',
        'status',
        'priority',
        'user_id',
        'course_content_id',
    ];

    public function getDeadlineLabelAttribute()
    {
        $deadline = Carbon::parse($this->deadline)->startOfDay();
        $now = Carbon::now()->startOfDay();

        if ($this->status == 1) {
            return 'Completed';
        }

        if ($now->greaterThan($deadline)) {
            return 'Overdue';
        }

        $diffInDays = (int) $now->diffInDays($deadline);

        if ($diffInDays == 0) {
            return 'Due today';
        } elseif ($diffInDays == 1) {
            return '1 day left';
        } else {
            return $diffInDays . ' days left';
        }
    }

    /**
     * Hex background color for the deadline badge in emails.
     * Mirrors the frontend getDeadlineBadgeClass() tiers.
     */
    public static function deadlineBadgeColor(?string $label): string
    {
        $normalized = strtolower(trim((string) $label));

        if (str_contains($normalized, 'completed')) {
            return '#16a34a';
        }

        if (str_contains($normalized, 'overdue') || str_contains($normalized, 'today')) {
            return '#dc2626';
        }

        if (preg_match('/^(\d+)\s*days?\b/', $normalized, $matches) === 1) {
            $days = (int) $matches[1];

            if ($days <= 1) {
                return '#dc2626';
            }

            if ($days <= 5) {
                return '#d97706';
            }

            return '#64748b';
        }

        return '#64748b';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course_content(): BelongsTo
    {
        return $this->belongsTo(CourseContent::class);
    }
}
