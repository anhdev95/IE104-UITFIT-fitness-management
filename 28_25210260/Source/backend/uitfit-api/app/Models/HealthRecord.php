<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'record_date', 'weight', 'height', 'bmi', 'body_fat', 'muscle_mass', 'waist', 'chest', 'note'])]
class HealthRecord extends Model
{
    protected function casts(): array
    {
        return [
            'record_date' => 'date:Y-m-d',
            'weight' => 'float',
            'height' => 'float',
            'bmi' => 'float',
            'body_fat' => 'float',
            'muscle_mass' => 'float',
            'waist' => 'float',
            'chest' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
