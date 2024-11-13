<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class UserController
{
    use ApiResponse;

    public function index()
    {
        $users = User::orderBy('name', 'ASC')->get();
        return $this->sendResponse($users, 'Users retrieved successfully');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|unique:users|email',
            'phone' => 'required|unique:users|integer',
            'password' => 'required',
        ]);

        $request['password'] = bcrypt($request['password']);
        $user = User::create($request->all());
        return $this->sendResponse($user, 'User created successfully', 201);
    }

    public function show(User $user)
    {
        //
    }

    public function update(Request $request, User $user)
    {
        //
    }

    public function destroy(User $user)
    {
        //
    }
}
