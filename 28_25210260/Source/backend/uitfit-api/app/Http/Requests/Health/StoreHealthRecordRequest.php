<?php

namespace App\Http\Requests\Health;

use Illuminate\Foundation\Http\FormRequest;

class StoreHealthRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'record_date' => ['required', 'date', 'before_or_equal:today'],
            'weight' => ['required', 'numeric', 'between:30,300'],
            'height' => ['required', 'numeric', 'between:100,250'],
            'body_fat' => ['nullable', 'numeric', 'between:1,70'],
            'muscle_mass' => ['nullable', 'numeric', 'between:1,200'],
            'waist' => ['nullable', 'numeric', 'between:30,250'],
            'chest' => ['nullable', 'numeric', 'between:30,250'],
            'note' => ['nullable', 'string', 'max:1000'],
            // bmi từ client (nếu có) sẽ bị bỏ qua — Laravel tự tính lại
        ];
    }
}
