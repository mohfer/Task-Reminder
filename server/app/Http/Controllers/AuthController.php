<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Setting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Events\Registered;

class AuthController
{
    use ApiResponse;

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember_me' => 'boolean',
        ]);

        $data['remember_me'] = $data['remember_me'] ?? 0;

        if (Auth::attempt(['email' => $request->email, 'password' => $request->password], $request->remember_me)) {
            $user = Auth::user();

            if ($request->remember_me == 1) {
                $token = $user->createToken('Task Reminder')->plainTextToken;
            } else if ($request->remember_me == 0) {
                $token = $user->createToken('Task Reminder', ['*'], now()->addMinutes(30))->plainTextToken;
            }

            $data = [
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ];

            return $this->sendResponse($data, 'User logged in successfully');
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

        event(new Registered($user));

        $token = $user->createToken('Task Reminder', ['*'], now()->addMinutes(30))->plainTextToken;

        $data = [
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ];

        return $this->sendResponse($data, 'User registered successfully', 201);
    }

    public function resendVerificationEmail(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return $this->sendResponse(null, 'Email already verified');
        }

        $user->sendEmailVerificationNotification();

        return $this->sendResponse(null, 'Verification email sent successfully');
    }

    public function verifyEmail(Request $request)
    {
        $user = User::findOrFail($request->route('id'));

        if ($user->hasVerifiedEmail()) {
            return $this->sendResponse(null, 'Email already verified');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return $this->sendResponse(null, 'Email verified successfully');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->sendResponse(null, 'User logged out successfully');
    }
}
