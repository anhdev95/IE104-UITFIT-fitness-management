<?php

namespace App\Http\Resources;

use App\Services\WorkoutService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkoutSessionResource extends JsonResource
{
    /** true: trả kèm danh sách exercise + sets (màn hình buổi tập / chi tiết lịch sử) */
    public bool $withDetail = false;

    public function detailed(): static
    {
        $this->withDetail = true;

        return $this;
    }

    public function toArray(Request $request): array
    {
        $plan = $this->relationLoaded('plan') ? $this->plan : null;

        $data = [
            'id' => $this->id,
            'workout_plan_id' => $this->workout_plan_id,
            'plan_name' => $this->plan_name,
            'plan' => $plan ? [
                'id' => $plan->id,
                'name' => $plan->name,
                'scheduled_date' => $plan->scheduled_date?->format('Y-m-d'),
                'difficulty' => $plan->difficulty,
                'description' => $plan->description,
            ] : null,
            'started_at' => $this->started_at,
            'completed_at' => $this->completed_at,
            'duration_seconds' => $this->status === 'in_progress'
                ? (int) max(0, $this->started_at->diffInSeconds(now()))
                : $this->duration_seconds,
            'status' => $this->status,
            'note' => $this->note,
            'summary' => $this->relationLoaded('sets') ? WorkoutService::summarize($this->sets) : null,
        ];

        if ($this->withDetail && $this->relationLoaded('sets')) {
            $data['exercises'] = WorkoutService::groupSetsByExercise($this->resource);
        }

        return $data;
    }
}
