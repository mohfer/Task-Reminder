<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'grade' => ['required', 'string', Rule::unique('grades')->where(fn ($query) => $query->where('user_id', $this->user()->id))],
            'grade_point' => ['required', 'numeric'],
            'minimal_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'maximal_score' => ['required', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
