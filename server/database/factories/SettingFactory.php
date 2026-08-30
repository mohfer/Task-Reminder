<?php

namespace Database\Factories;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Factories\Factory;

class SettingFactory extends Factory
{
    protected $model = Setting::class;

    public function definition(): array
    {
        return [
            'deadline_notification' => '5 days left',
            'task_created_notification' => 1,
            'task_completed_notification' => 1,
            'notification_channel' => Setting::CHANNEL_EMAIL,
            'telegram_chat_id' => null,
            'siakang_email' => null,
            'siakang_password' => null,
            'user_id' => null,
        ];
    }

    public function withSiakangCredentials(): static
    {
        return $this->state(fn () => [
            'siakang_email' => 'student@student.untirta.ac.id',
            'siakang_password' => 'secret',
        ]);
    }
}
