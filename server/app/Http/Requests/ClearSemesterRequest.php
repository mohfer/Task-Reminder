<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClearSemesterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'semester' => ['required', 'string'],
        ];
    }
}
