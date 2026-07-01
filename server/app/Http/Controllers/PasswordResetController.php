<?php

namespace App\Http\Controllers;

use App\Services\PasswordResetService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class PasswordResetController
{
    public function __construct(
        private readonly PasswordResetService $passwordResetService
    ) {}

    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = $this->passwordResetService->sendResetLink($request->email);

        $message = $status === Password::RESET_LINK_SENT
            ? 'If that email is registered, we have sent a password reset link.'
            : 'If that email is registered, we have sent a password reset link.';

        return response()->json(['message' => $message], 200);
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

        $message = $status === Password::PASSWORD_RESET
            ? 'Password has been reset successfully.'
            : 'Unable to reset password. The token may be invalid or expired.';

        return response()->json(['message' => $message], $status === Password::PASSWORD_RESET ? 200 : 400);
    }
}
