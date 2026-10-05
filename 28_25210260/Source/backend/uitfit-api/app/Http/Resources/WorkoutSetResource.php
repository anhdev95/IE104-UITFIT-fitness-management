<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkoutSetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workout_session_id' => $this->workout_session_id,
            'exercise_id' => $this->exercise_id,
            'set_number' => $this->set_number,
            'target_reps' => $this->target_reps,
            'actual_reps' => $this->actual_reps,
            'target_weight' => $this->target_weight,
            'actual_weight' => $this->actual_weight,
            'rpe' => $this->rpe,
            'rest_seconds' => $this->rest_seconds,
            'completed' => $this->completed,
            'note' => $this->note,
            'completed_at' => $this->completed_at,
            'volume' => $this->completed ? round(($this->actual_reps ?? 0) * ($this->actual_weight ?? 0), 2) : 0,
        ];
    }
}
