<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Http\FormRequest;

class CourseContentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
        // return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
    {
        $courseContentId = $this->route('course_content');

        return [
            'semester' => 'required',
            'code' => ['required', Rule::unique('course_contents')->ignore($courseContentId),],
            'course_content' => ['required', Rule::unique('course_contents',)->ignore($courseContentId),],
            'scu' => 'required|integer|min:1',
            'lecturer' => 'required',
            'day' => 'required',
            'hour_start' => 'required',
            'hour_end' => 'required',
        ];
    }
}
