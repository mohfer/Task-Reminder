<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class UserController
{
    use ApiResponse;

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['required', 'integer', Rule::unique('users', 'phone')->ignore($user->id)]
        ]);

        $user->update($request->all());

        return $this->sendResponse($user, 'User updated successfully');
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'old_password' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->old_password, $user->password)) {
            return $this->sendError('Old password is incorrect', 401);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return $this->sendResponse(null, 'Password updated successfully');
    }

    public function getAuthenticatedUser(Request $request)
    {
        $user = $request->user()->id;

        if ($user) {
            return $this->sendResponse($user, 'User retrieved successfully');
        }

        return $this->sendError('User not found', 404);
    }
}
