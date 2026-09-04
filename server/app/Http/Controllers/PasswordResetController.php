<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\SendResetLinkRequest;
use App\Services\PasswordResetService;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Password;

class PasswordResetController
{
    use ApiResponse;

    public function __construct(
        private readonly PasswordResetService $passwordResetService
    ) {}

    public function sendResetLink(SendResetLinkRequest $request)
    {
        $this->passwordResetService->sendResetLink($request->validated()['email']);

        return $this->sendResponse(null, 'If that email is registered, we have sent a password reset link.');
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $status = $this->passwordResetService->resetPassword($request->validated());

        if ($status === Password::PASSWORD_RESET) {
            return $this->sendResponse(null, 'Password has been reset successfully.');
        }

        return $this->sendError('Unable to reset password. The token may be invalid or expired.', 400);
    }
}
