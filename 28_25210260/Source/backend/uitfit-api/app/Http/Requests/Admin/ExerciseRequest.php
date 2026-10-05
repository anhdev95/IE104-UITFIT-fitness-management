<?php

namespace App\Http\Requests\Admin;

use App\Models\Exercise;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExerciseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('exercise')?->id ?? $this->route('exercise');

        return [
            'name' => ['required', 'string', 'max:150', Rule::unique('exercises', 'name')->ignore($id)],
            'muscle_group' => ['required', Rule::in(Exercise::MUSCLE_GROUPS)],
            'difficulty' => ['required', Rule::in(Exercise::DIFFICULTIES)],
            'equipment' => ['nullable', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:5000'],
            'instructions' => ['required', 'string', 'max:5000'],
            'target_muscles' => ['nullable', 'string', 'max:255'],
            'tips' => ['nullable', 'string', 'max:5000'],
            'image' => ['nullable', 'string', 'max:255'],
            'image_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif,svg', 'max:4096'],
            'video_url' => ['nullable', 'url', 'max:255'],
            'default_sets' => ['required', 'integer', 'min:1', 'max:20'],
            'default_reps' => ['required', 'string', 'max:20'],
            'default_rest_seconds' => ['required', 'integer', 'min:0', 'max:900'],
            'status' => ['nullable', 'in:active,inactive'],
        ];
    }

    public function attributes(): array
    {
        return ['name' => 'tên bài tập'];
    }

    public function messages(): array
    {
        return ['name.unique' => 'Tên bài tập đã tồn tại.'];
    }
}
