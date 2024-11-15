<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $appends = ['deadline_text'];

    protected $guarded = [
        'id'
    ];

    public function getDeadlineTextAttribute()
    {
        $deadline = Carbon::parse($this->deadline)->startOfDay();
        $now = Carbon::now()->startOfDay();

        if ($now->greaterThan($deadline)) {
            return 'Overdue';
        }

        $diffInDays = $now->diffInDays($deadline);

        if ($diffInDays === 0) {
            return 'Due today';
        } else if ($diffInDays === 1) {
            return '1 day left';
        } else {
            return $diffInDays . ' days left';
        }
    }

    public function user(): BelongsTo
    {
        return $this->beloBelongsTo(User::class, 'user_id');
    }

    public function course_content(): BelongsTo
    {
        return $this->beloBelongsTo(CourseContent::class, 'course_content_id');
    }
}
