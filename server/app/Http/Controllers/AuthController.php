<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Grade;
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
            'remember_me' => 'boolean'
        ]);

        if (Auth::attempt(['email' => $request->email, 'password' => $request->password], $request->remember_me)) {
            $user = Auth::user();

            if ($request['remember_me'] == true) {
                $token = $user->createToken('Task Reminder', ['*'], now()->addDays(7))->plainTextToken;
            } else if ($request['remember_me'] == false) {
                $token = $user->createToken('Task Reminder', ['*'], now()->addHours(1))->plainTextToken;
            }

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
            'password' => 'required|min:8',
            'password_confirmation' => 'required|same:password',
        ]);

        $request['password'] = bcrypt($request['password']);
        $user = User::create($request->all());

        Setting::create([
            'deadline_notification' => "5 days left",
            'task_created_notification' => 1,
            'task_completed_notification' => 1,
            'user_id' => $user->id
        ]);

        Grade::insert([
            [
                'grade' => 'A',
                'quality_number' => 4.00,
                'minimal_score' => 85.00,
                'maximal_score' => 100.00,
                'user_id' => $user->id,
            ],
            [
                'grade' => 'A-',
                'quality_number' => 3.75,
                'minimal_score' => 80.00,
                'maximal_score' => 84.99,
                'user_id' => $user->id,
            ],
            [
                'grade' => 'B+',
                'quality_number' => 3.50,
                'minimal_score' => 75.00,
                'maximal_score' => 79.99,
                'user_id' => $user->id,
            ],
            [
                'grade' => 'B',
                'quality_number' => 3.00,
                'minimal_score' => 70.00,
                'maximal_score' => 74.99,
                'user_id' => $user->id,
            ],
            [
                'grade' => 'B-',
                'quality_number' => 2.75,
                'minimal_score' => 65.00,
                'maximal_score' => 69.99,
                'user_id' => $user->id,
            ],
            [
                'grade' => 'C+',
                'quality_number' => 2.50,
                'minimal_score' => 60.00,
                'maximal_score' => 64.99,
                'user_id' => $user->id,
            ],
            [
                'grade' => 'C',
                'quality_number' => 2.00,
                'minimal_score' => 56.00,
                'maximal_score' => 59.99,
                'user_id' => $user->id,
            ],
            [
                'grade' => 'D',
                'quality_number' => 1.00,
                'minimal_score' => 50.00,
                'maximal_score' => 55.99,
                'user_id' => $user->id,
            ],
            [
                'grade' => 'E',
                'quality_number' => 0.00,
                'minimal_score' => 0.00,
                'maximal_score' => 49.99,
                'user_id' => $user->id,
            ],
        ]);


        event(new Registered($user));

        $token = $user->createToken('Task Reminder', ['*'], now()->addHours(1))->plainTextToken;

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

        $tokenRecord = DB::table('personal_access_tokens')->where('id', $token)->first();

        if (!$tokenRecord) {
            return $this->sendError('Token not found', 401);
        }

        $expiresAt = Carbon::parse($tokenRecord->expires_at);
        $currentTime = Carbon::now();

        if ($currentTime->greaterThan($expiresAt)) {
            return $this->sendError('Token expired', 401);
        }

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
