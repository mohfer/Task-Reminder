<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Services\UserService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class UserController
{
    use ApiResponse;

    public function __construct(
        private readonly UserService $userService
    ) {}

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $this->userService->updateProfile($request->user(), $request->validated());

        return $this->sendResponse($user, 'User updated successfully');
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        try {
            $this->userService->changePassword($request->user(), $request->validated()['old_password'], $request->validated()['password']);
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 401);
        }

        return $this->sendResponse(null, 'Password updated successfully');
    }

    public function getAuthenticatedUser(Request $request)
    {
        $data = $this->userService->getAuthenticatedUser($request->user());

        return $this->sendResponse($data, 'User retrieved successfully');
    }
}
