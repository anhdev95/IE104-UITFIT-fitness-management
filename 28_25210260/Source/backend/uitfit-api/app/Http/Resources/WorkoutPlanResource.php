<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkoutPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $exercisesLoaded = $this->relationLoaded('planExercises');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'scheduled_date' => $this->scheduled_date?->format('Y-m-d'),
            'estimated_duration' => $this->estimated_duration,
            'difficulty' => $this->difficulty,
            'status' => $this->status,
            'exercises_count' => $exercisesLoaded ? $this->planExercises->count() : $this->whenCounted('planExercises'),
            'total_sets' => $this->when($exercisesLoaded, fn () => $this->planExercises->sum('target_sets')),
            'progress' => $this->progress(),
            'active_session_id' => $this->relationLoaded('activeSession') ? $this->activeSession?->id : null,
            'exercises' => $this->when($exercisesLoaded, fn () => $this->planExercises->map(fn ($pe) => [
                'id' => $pe->id,
                'exercise_id' => $pe->exercise_id,
                'order_index' => $pe->order_index,
                'target_sets' => $pe->target_sets,
                'target_reps' => $pe->target_reps,
                'target_weight' => $pe->target_weight,
                'rest_seconds' => $pe->rest_seconds,
                'note' => $pe->note,
                'exercise' => $pe->relationLoaded('exercise') && $pe->exercise
                    ? new ExerciseResource($pe->exercise)
                    : null,
            ])->values()),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /** Tiến độ (%) của lịch tập: completed = 100, đang tập = set đã xong / tổng set của buổi đang tập */
    private function progress(): int
    {
        if ($this->status === 'completed') {
            return 100;
        }
        if ($this->relationLoaded('activeSession') && $this->activeSession) {
            $sets = $this->activeSession->sets;
            $total = $sets->count();

            return $total ? (int) round($sets->where('completed', true)->count() / $total * 100) : 0;
        }

        return 0;
    }
}
