<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSiakangCredentialsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'siakang_email' => ['required', 'email'],
            'siakang_password' => ['required', 'string', 'min:1'],
        ];
    }
}
