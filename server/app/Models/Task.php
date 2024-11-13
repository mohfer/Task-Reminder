<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Task extends Model
{
    protected $guarded = [
        'id'
    ];

    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'user_id');
    }

    public function course_content(): HasOne
    {
        return $this->hasOne(CourseContent::class, 'course_content_id');
    }
}
