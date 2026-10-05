<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'workout_session_id', 'exercise_id', 'set_number', 'target_reps', 'actual_reps', 'target_weight',
    'actual_weight', 'rpe', 'rest_seconds', 'completed', 'note', 'completed_at',
])]
class WorkoutSet extends Model
{
    protected function casts(): array
    {
        return [
            'set_number' => 'integer',
            'target_reps' => 'integer',
            'actual_reps' => 'integer',
            'target_weight' => 'float',
            'actual_weight' => 'float',
            'rpe' => 'float',
            'rest_seconds' => 'integer',
            'completed' => 'boolean',
            'completed_at' => 'datetime',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(WorkoutSession::class, 'workout_session_id');
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }
}
