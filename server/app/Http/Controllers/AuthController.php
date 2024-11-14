<?php

namespace App\Http\Controllers;

use App\Models\User;
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
        ]);

        if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            $user = Auth::user();

            $token = $user->createToken('Task Reminder')->plainTextToken;

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

        $token = $user->createToken('Task Reminder')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'token' => $token,
            'token_type' => 'Bearer',
            'data' => $user
        ], 200);
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
