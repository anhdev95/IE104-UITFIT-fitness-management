<?php

namespace App\Http\Resources;

use App\Support\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $profile = $this->whenLoaded('profile');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status,
            'avatar_url' => $this->relationLoaded('profile') ? Media::url($this->profile?->avatar) : null,
            'profile' => $this->when($this->relationLoaded('profile'), fn () => $this->profile ? [
                'gender' => $this->profile->gender,
                'date_of_birth' => $this->profile->date_of_birth?->format('Y-m-d'),
                'height' => $this->profile->height,
                'current_weight' => $this->profile->current_weight,
                'goal' => $this->profile->goal,
                'bio' => $this->profile->bio,
                'avatar_url' => Media::url($this->profile->avatar),
            ] : null),
            'workout_plans_count' => $this->whenCounted('workoutPlans'),
            'workout_sessions_count' => $this->whenCounted('workoutSessions'),
            'health_records_count' => $this->whenCounted('healthRecords'),
            'created_at' => $this->created_at,
        ];
    }
}
