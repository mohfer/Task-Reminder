<?php

namespace App\Http\Controllers;

use App\Services\PasswordResetService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class PasswordResetController
{
    use ApiResponse;

    public function __construct(
        private readonly PasswordResetService $passwordResetService
    ) {}

    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $this->passwordResetService->sendResetLink($request->email);

        return $this->sendResponse(null, 'If that email is registered, we have sent a password reset link.');
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:8',
            'password_confirmation' => 'required|same:password',
        ]);

        $status = $this->passwordResetService->resetPassword($request->only('email', 'password', 'password_confirmation', 'token'));

        if ($status === Password::PASSWORD_RESET) {
            return $this->sendResponse(null, 'Password has been reset successfully.');
        }

        return $this->sendError('Unable to reset password. The token may be invalid or expired.', 400);
    }
}
