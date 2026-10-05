<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'gender', 'date_of_birth', 'height', 'current_weight', 'goal', 'avatar', 'bio'])]
class UserProfile extends Model
{
    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date:Y-m-d',
            'height' => 'float',
            'current_weight' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
