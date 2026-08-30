<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function updateProfile(User $user, array $data): User
    {
        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
        ]);

        return $user;
    }

    public function changePassword(User $user, string $oldPassword, string $newPassword): void
    {
        if (! Hash::check($oldPassword, $user->password)) {
            throw new \Exception('Current password is incorrect', 401);
        }

        $user->password = Hash::make($newPassword);
        $user->save();
    }

    public function getAuthenticatedUser(User $user): array
    {
        $user->load('setting');

        $setting = $user->setting;
        $settings = $setting ? $setting->toArray() : null;

        if ($settings && $setting->hasSiakangCredentials()) {
            $settings['has_siakang_credentials'] = true;
        } elseif ($settings) {
            $settings['has_siakang_credentials'] = false;
        }

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'settings' => $settings,
        ];
    }
}
