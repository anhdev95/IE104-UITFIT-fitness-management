<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['workout_plan_id', 'exercise_id', 'order_index', 'target_sets', 'target_reps', 'target_weight', 'rest_seconds', 'note'])]
class WorkoutPlanExercise extends Model
{
    protected function casts(): array
    {
        return [
            'order_index' => 'integer',
            'target_sets' => 'integer',
            'target_weight' => 'float',
            'rest_seconds' => 'integer',
        ];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(WorkoutPlan::class, 'workout_plan_id');
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }
}
