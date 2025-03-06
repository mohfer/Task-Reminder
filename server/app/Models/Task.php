<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Task extends Model
{
    protected $appends = ['deadline_label'];

    protected $guarded = [
        'id'
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

    public function getCreatedAtAttribute($value)
    {
        $created_at = Carbon::parse($value)->locale('id');
        $created_at->settings(['formatFunction' => 'translatedFormat']);
        return $created_at->format('j F Y');
    }

    public function getUpdatedAtAttribute($value)
    {
        $updated_at = Carbon::parse($value)->locale('id');
        $updated_at->settings(['formatFunction' => 'translatedFormat']);
        return $updated_at->format('j F Y');
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'user_id');
    }

    public function course_content(): HasOne
    {
        return $this->hasOne(CourseContent::class, 'id', 'course_content_id');
    }
}
