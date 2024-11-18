<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Setting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Auth\Events\Verified;
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
        ]);

        if (Auth::attempt(['email' => $request->email, 'password' => $request->password], $request->remember_me)) {
            $user = Auth::user();

            $token = $user->createToken('Task Reminder')->plainTextToken;

            $data = [
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ];

            return $this->sendResponse($data, 'User logged in successfully');
        }

        return $this->sendError('Email or password is incorrect', 401);
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

        $token = $user->createToken('Task Reminder')->plainTextToken;

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
        if (! $request->hasValidSignature()) {
            return $this->sendResponse(null, 'Invalid or expired verification link', 400);
        }

        $user = User::findOrFail($request->route('id'));

        if ($user->hasVerifiedEmail()) {
            return $this->sendResponse(null, 'Email already verified', 202);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return $this->sendResponse(null, 'Email verified successfully');
    }

    public function checkToken(Request $request)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return $this->sendError('Token not found', 401);
        }

        // $tokenRecord = DB::table('personal_access_tokens')->where('id', $token)->first();

        // if (!$tokenRecord) {
        //     return $this->sendError('Token not found', 401);
        // }

        // $expiresAt = Carbon::parse($tokenRecord->expires_at);
        // $currentTime = Carbon::now();

        // if ($currentTime->greaterThan($expiresAt)) {
        //     return $this->sendError('Token expired', 401);
        // }

        return response()->json(['status' => true]);
    }

    public function checkEmail(Request $request)
    {
        $email = $request->user()->email;

        if (!$email) {
            return $this->sendError('Email not found', 404);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return $this->sendError('Email not found', 404);
        }

        if ($user->email_verified_at !== null) {
            return response()->json(['status' => true]);
        }

        return response()->json(['status' => false]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->sendResponse(null, 'User logged out successfully');
    }
}
