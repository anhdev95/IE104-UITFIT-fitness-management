<?php

namespace App\Http\Resources;

use App\Support\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExerciseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'muscle_group' => $this->muscle_group,
            'difficulty' => $this->difficulty,
            'equipment' => $this->equipment,
            'description' => $this->description,
            'instructions' => $this->instructions,
            'instruction_steps' => array_values(array_filter(array_map('trim', preg_split('/\r?\n/', (string) $this->instructions)))),
            'target_muscles' => $this->target_muscles,
            'tips' => $this->tips,
            'image' => $this->image,
            'image_url' => Media::url($this->image),
            'video_url' => $this->video_url,
            'default_sets' => $this->default_sets,
            'default_reps' => $this->default_reps,
            'default_rest_seconds' => $this->default_rest_seconds,
            'status' => $this->status,
            'usage_count' => $this->whenCounted('planExercises'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
