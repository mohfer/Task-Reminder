<?php

namespace App\Http\Controllers;

use App\Models\Setting;
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

        $user->update($request->all());

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
        $settings = Setting::where('user_id', $request->user()->id)->first();

        $user = [
            'id' => $request->user()->id,
            'name' => $request->user()->name,
            'email' => $request->user()->email,
        ];

        $data = [
            'user' => $user,
            'settings' => $settings
        ];

        if ($data) {
            return $this->sendResponse($data, 'User retrieved successfully');
        }

        return $this->sendError('User not found', 404);
    }
}
