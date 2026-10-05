<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'gender' => ['nullable', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'height' => ['nullable', 'numeric', 'between:100,250'],
            'current_weight' => ['nullable', 'numeric', 'between:30,300'],
            'goal' => ['nullable', 'in:lose_weight,gain_muscle,maintain,general_fitness'],
            'bio' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
