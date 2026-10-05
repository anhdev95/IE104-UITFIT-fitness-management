<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name', 'slug', 'muscle_group', 'difficulty', 'equipment', 'description', 'instructions',
    'target_muscles', 'tips', 'image', 'video_url', 'default_sets', 'default_reps',
    'default_rest_seconds', 'status',
])]
class Exercise extends Model
{
    public const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'legs', 'arms', 'core', 'cardio'];
    public const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

    protected function casts(): array
    {
        return [
            'default_sets' => 'integer',
            'default_rest_seconds' => 'integer',
        ];
    }

    public function planExercises(): HasMany
    {
        return $this->hasMany(WorkoutPlanExercise::class);
    }

    public function workoutSets(): HasMany
    {
        return $this->hasMany(WorkoutSet::class);
    }
}
