<?php

namespace App\Http\Requests\Workout;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WorkoutPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'scheduled_date' => ['nullable', 'date'],
            'estimated_duration' => ['nullable', 'integer', 'min:1', 'max:600'],
            'difficulty' => ['nullable', 'in:beginner,intermediate,advanced'],
            'exercises' => ['required', 'array', 'min:1', 'max:30'],
            'exercises.*.exercise_id' => ['required', 'integer', Rule::exists('exercises', 'id')],
            'exercises.*.target_sets' => ['required', 'integer', 'min:1', 'max:20'],
            // "10" hoặc khoảng "8-12"
            'exercises.*.target_reps' => ['required', 'string', 'max:20', 'regex:/^\d{1,3}(\s*-\s*\d{1,3})?$/'],
            'exercises.*.target_weight' => ['nullable', 'numeric', 'min:0', 'max:1000'],
            'exercises.*.rest_seconds' => ['required', 'integer', 'min:0', 'max:900'],
            'exercises.*.note' => ['nullable', 'string', 'max:255'],
            'exercises.*.order_index' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function attributes(): array
    {
        return ['name' => 'tên lịch tập'];
    }

    public function messages(): array
    {
        return [
            'exercises.required' => 'Lịch tập phải có ít nhất 1 bài tập.',
            'exercises.min' => 'Lịch tập phải có ít nhất 1 bài tập.',
            'exercises.*.target_sets.min' => 'Số set phải lớn hơn 0.',
            'exercises.*.target_reps.regex' => 'Số reps phải là một số (vd: 10) hoặc khoảng (vd: 8-12).',
        ];
    }
}
