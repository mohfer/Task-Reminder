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
            'email' => 'required|email|exists:users,email',
        ]);

        $status = $this->passwordResetService->sendResetLink($request->email);

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => __($status)], 200)
            : response()->json(['message' => __($status)], 400);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required',
            'password' => 'required|min:8',
            'password_confirmation' => 'required|same:password',
        ]);

        $status = $this->passwordResetService->resetPassword($request->only('email', 'password', 'password_confirmation', 'token'));

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => __($status)], 200)
            : response()->json(['message' => __($status)], 400);
    }
}
