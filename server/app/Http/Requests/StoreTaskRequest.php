<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'task' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'deadline' => ['required', 'date'],
            'priority' => ['sometimes', 'boolean'],
            'course_content_id' => ['required', 'exists:course_contents,id'],
        ];
    }
}
