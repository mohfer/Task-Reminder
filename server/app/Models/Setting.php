<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    protected $guarded = [
        'id'
    ];

    public $timestamps = false;

    public function user(): BelongsTo
    {
        return $this->beloBelongsTo(User::class, 'user_id');
    }
}
