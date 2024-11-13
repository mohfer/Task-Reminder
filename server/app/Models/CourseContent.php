<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseContent extends Model
{
    protected $guarded = [
        'id'
    ];

    public $timestamps = false;

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
}
