<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['user_id', 'name', 'description', 'scheduled_date', 'estimated_duration', 'difficulty', 'status'])]
class WorkoutPlan extends Model
{
    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date:Y-m-d',
            'estimated_duration' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function planExercises(): HasMany
    {
        return $this->hasMany(WorkoutPlanExercise::class)->orderBy('order_index');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(WorkoutSession::class);
    }

    /** Buổi tập đang diễn ra (nếu có) */
    public function activeSession(): HasOne
    {
        return $this->hasOne(WorkoutSession::class)->where('status', 'in_progress')->latestOfMany();
    }

    public function latestSession(): HasOne
    {
        return $this->hasOne(WorkoutSession::class)->latestOfMany();
    }
}
