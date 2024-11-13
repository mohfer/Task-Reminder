<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Setting extends Model
{
    protected $guarded = [
        'id'
    ];

    public $timestamps = false;

    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'user_id');
    }
}
