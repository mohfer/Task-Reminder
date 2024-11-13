<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Registered;

class AuthController
{
    use ApiResponse;

    public function login(Request $request)
    {
        //
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|unique:users|email',
            'phone' => 'required|unique:users|integer',
            'password' => 'required',
        ]);

        $request['password'] = bcrypt($request['password']);
        $user = User::create($request->all());
        event(new Registered($user));
        return $this->sendResponse($user, 'User created successfully', 201);
    }
}
