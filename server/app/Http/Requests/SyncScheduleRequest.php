<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SyncScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'semester' => ['nullable', 'string'],
            'source_semester' => ['nullable', 'string'],
        ];
    }
}
