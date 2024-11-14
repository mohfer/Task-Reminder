<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class UserController
{
    use ApiResponse;

    public function getAuthenticatedUser(Request $request)
    {
        $user = $request->user();

        if ($user) {
            return $this->sendResponse($user, 'User retrieved successfully');
        }

        return $this->sendError('User not found', 404);
    }

    public function index()
    {
        $users = User::orderBy('name', 'ASC')->get();
        return $this->sendResponse($users, 'Users retrieved successfully');
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
