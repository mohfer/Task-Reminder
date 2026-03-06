<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController
{
    use ApiResponse;

    public function __construct(
        private readonly UserService $userService
    ) {}

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($request->user()->id)],
        ]);

        $user = $this->userService->updateProfile($request->user(), $request->only(['name', 'email']));

        return $this->sendResponse($user, 'User updated successfully');
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'old_password' => 'required',
            'password' => 'required|min:8',
            'password_confirmation' => 'required|same:password'
        ]);

        try {
            $this->userService->changePassword($request->user(), $request->old_password, $request->password);
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
