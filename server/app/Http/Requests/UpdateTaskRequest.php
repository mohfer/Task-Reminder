<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'task' => ['required', 'string'],
            'deadline' => ['required', 'date'],
            'course_content_id' => ['required', 'exists:course_contents,id'],
        ];
    }
}
