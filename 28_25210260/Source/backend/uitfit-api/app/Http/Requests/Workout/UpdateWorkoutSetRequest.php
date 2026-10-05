<?php

namespace App\Http\Requests\Workout;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkoutSetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'actual_reps' => ['nullable', 'integer', 'min:0', 'max:999', 'required_if:completed,true'],
            'actual_weight' => ['nullable', 'numeric', 'min:0', 'max:1000'],
            'rpe' => ['nullable', 'numeric', 'between:1,10'],
            'rest_seconds' => ['nullable', 'integer', 'min:0', 'max:900'],
            'note' => ['nullable', 'string', 'max:255'],
            'completed' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'actual_reps.required_if' => 'Vui lòng nhập số reps thực tế trước khi hoàn thành set.',
            'rpe.between' => 'RPE phải nằm trong khoảng 1 - 10.',
        ];
    }
}
