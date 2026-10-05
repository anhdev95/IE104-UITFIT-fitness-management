<?php

namespace App\Http\Resources;

use App\Services\HealthService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HealthRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'record_date' => $this->record_date?->format('Y-m-d'),
            'weight' => $this->weight,
            'height' => $this->height,
            'bmi' => $this->bmi,
            'bmi_category' => HealthService::bmiCategory($this->bmi),
            'body_fat' => $this->body_fat,
            'muscle_mass' => $this->muscle_mass,
            'waist' => $this->waist,
            'chest' => $this->chest,
            'note' => $this->note,
            'created_at' => $this->created_at,
        ];
    }
}
