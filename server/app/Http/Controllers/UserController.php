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
        ]);

        $user->update($request->only(['name', 'email']));

        return $this->sendResponse($user, 'User updated successfully');
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'old_password' => 'required',
            'password' => 'required|min:8',
            'password_confirmation' => 'required|same:password'
        ]);

        $user = $request->user();

        if (!Hash::check($request->old_password, $user->password)) {
            return $this->sendError('Current password is incorrect', 401);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return $this->sendResponse(null, 'Password updated successfully');
    }

    public function getAuthenticatedUser(Request $request)
    {
        $user = $request->user();
        $user->load('setting');

        return $this->sendResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'settings' => $user->setting,
        ], 'User retrieved successfully');
    }
}
