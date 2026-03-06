<?php

namespace App\Services;

use App\Models\Grade;
use App\Models\Setting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuthService
{
    public function login(array $credentials, bool $rememberMe): array
    {
        if (!Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']], $rememberMe)) {
            throw new \Exception('Email or password is incorrect', 401);
        }

        $user = Auth::user();

        if (!$user instanceof User) {
            throw new \Exception('User not found', 404);
        }

        $expiration = $rememberMe ? now()->addDays(7) : now()->addHours(1);
        $token = $user->createToken('Task Reminder', ['*'], $expiration)->plainTextToken;

        return [
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ];
    }

    public function register(array $data): array
    {
        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
            ]);

            Setting::create([
                'deadline_notification' => '5 days left',
                'task_created_notification' => 1,
                'task_completed_notification' => 1,
                'user_id' => $user->id,
            ]);

            Grade::insert($this->getDefaultGrades($user->id));

            return $user;
        });

        event(new Registered($user));

        $token = $user->createToken('Task Reminder', ['*'], now()->addHours(1))->plainTextToken;

        return [
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ];
    }

    public function resendVerificationEmail(User $user): void
    {
        if ($user->hasVerifiedEmail()) {
            throw new \Exception('Email already verified', 200);
        }

        $user->sendEmailVerificationNotification();
    }

    public function verifyEmail(int $userId): void
    {
        $user = User::findOrFail($userId);

        if ($user->hasVerifiedEmail()) {
            throw new \Exception('Email already verified', 202);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }
    }

    public function checkToken(string $token): bool
    {
        $tokenRecord = DB::table('personal_access_tokens')->where('id', $token)->first();

        if (!$tokenRecord) {
            return false;
        }

        return !Carbon::now()->greaterThan(Carbon::parse($tokenRecord->expires_at));
    }

    public function checkEmailVerified(User $user): bool
    {
        return $user->email_verified_at !== null;
    }

    public function logout(User $user): void
    {
        $token = $user->currentAccessToken();

        if ($token && isset($token->id)) {
            $user->tokens()->whereKey($token->id)->delete();
        }
    }

    private function getDefaultGrades(int $userId): array
    {
        return [
            ['grade' => 'A', 'grade_point' => 4.00, 'minimal_score' => 85.00, 'maximal_score' => 100.00, 'user_id' => $userId],
            ['grade' => 'A-', 'grade_point' => 3.75, 'minimal_score' => 80.00, 'maximal_score' => 84.99, 'user_id' => $userId],
            ['grade' => 'B+', 'grade_point' => 3.50, 'minimal_score' => 75.00, 'maximal_score' => 79.99, 'user_id' => $userId],
            ['grade' => 'B', 'grade_point' => 3.00, 'minimal_score' => 70.00, 'maximal_score' => 74.99, 'user_id' => $userId],
            ['grade' => 'B-', 'grade_point' => 2.75, 'minimal_score' => 65.00, 'maximal_score' => 69.99, 'user_id' => $userId],
            ['grade' => 'C+', 'grade_point' => 2.50, 'minimal_score' => 60.00, 'maximal_score' => 64.99, 'user_id' => $userId],
            ['grade' => 'C', 'grade_point' => 2.00, 'minimal_score' => 56.00, 'maximal_score' => 59.99, 'user_id' => $userId],
            ['grade' => 'D', 'grade_point' => 1.00, 'minimal_score' => 50.00, 'maximal_score' => 55.99, 'user_id' => $userId],
            ['grade' => 'E', 'grade_point' => 0.00, 'minimal_score' => 0.00, 'maximal_score' => 49.99, 'user_id' => $userId],
        ];
    }
}
