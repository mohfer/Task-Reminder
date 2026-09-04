<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $gradeId = $this->route('grade') ?? $this->route('id');

        return [
            'grade' => ['required', 'string', Rule::unique('grades')->where(fn ($query) => $query->where('user_id', $this->user()->id))->ignore($gradeId)],
            'grade_point' => ['required', 'numeric'],
            'minimal_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'maximal_score' => ['required', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
