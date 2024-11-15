<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Setting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Events\Registered;

class AuthController
{
    use ApiResponse;

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember_me' => 'boolean'
        ]);

        if (Auth::attempt(['email' => $request->email, 'password' => $request->password], $request->remember_me)) {
            $user = Auth::user();

            // Generate token
            $token = $request->remember_me
                ? $user->createToken('Task Reminder')->plainTextToken
                : $user->createToken('Task Reminder', ['*'], now()->addMinutes(30))->plainTextToken;

            return response()->json([
                'message' => 'User logged in successfully',
                'token' => $token,
                'token_type' => 'Bearer',
                'data' => $user
            ], 200);
        }

        return $this->sendError('Username or password is incorrect', 401);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'phone' => 'required|unique:users|integer',
            'password' => 'required|min:8',
            'password_confirmation' => 'required|same:password',
        ]);

        $request['password'] = bcrypt($request['password']);
        $user = User::create($request->all());

        Setting::create([
            'deadline_notification' => "3 days left",
            'task_created_notification' => 1,
            'task_completed_notification' => 1,
            'user_id' => $user->id
        ]);

        $token = $user->createToken('Task Reminder', ['*'], now()->addMinutes(30))->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'token' => $token,
            'token_type' => 'Bearer',
            'data' => $user
        ], 201);
    }

    public function verify()
    {
        return $this->sendResponse(null, 'User verified successfully');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->sendResponse(null, 'User logged out successfully');
    }
}
