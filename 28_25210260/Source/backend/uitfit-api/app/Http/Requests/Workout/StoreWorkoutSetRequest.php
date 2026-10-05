<?php

namespace App\Http\Requests\Workout;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWorkoutSetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exercise_id' => ['required', 'integer', Rule::exists('exercises', 'id')],
            'target_reps' => ['nullable', 'integer', 'min:0', 'max:999'],
            'target_weight' => ['nullable', 'numeric', 'min:0', 'max:1000'],
            'rest_seconds' => ['nullable', 'integer', 'min:0', 'max:900'],
        ];
    }
}
