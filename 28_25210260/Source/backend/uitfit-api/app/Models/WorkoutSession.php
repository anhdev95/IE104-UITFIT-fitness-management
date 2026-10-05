<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'workout_plan_id', 'plan_name', 'started_at', 'completed_at', 'duration_seconds', 'status', 'note'])]
class WorkoutSession extends Model
{
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'duration_seconds' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(WorkoutPlan::class, 'workout_plan_id');
    }

    public function sets(): HasMany
    {
        return $this->hasMany(WorkoutSet::class)->orderBy('id');
    }
}
