<?php

namespace App\Http\Requests\Workout;

use Illuminate\Foundation\Http\FormRequest;

class CompleteSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
