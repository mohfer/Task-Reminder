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

        $diffInDays = $now->diffInDays($deadline);

        if ($diffInDays == 0) {
            return 'Due today';
        } else if ($diffInDays === 1) {
            return '1 day left';
        } else {
            return $diffInDays . ' days left';
        }
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
