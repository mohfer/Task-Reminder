<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourseContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'semester' => ['required', 'string'],
            'code' => ['required', 'string'],
            'course_content' => ['required', 'string'],
            'credits' => ['required', 'integer', 'min:1'],
            'lecturer' => ['required', 'string'],
            'day' => ['required', 'string'],
            'hour_start' => ['required', 'string'],
            'hour_end' => ['required', 'string'],
        ];
    }
}
