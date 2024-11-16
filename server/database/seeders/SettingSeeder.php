<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'deadline_notification' => '7 days left',
                'task_created_notification' => '1',
                'task_completed_notification' => '1',
                'user_id' => 1,
            ],
            [
                'deadline_notification' => '3 days left',
                'task_created_notification' => '1',
                'task_completed_notification' => '0',
                'user_id' => 2,
            ],
            [
                'deadline_notification' => '5 days left',
                'task_created_notification' => '1',
                'task_completed_notification' => '1',
                'user_id' => 3,
            ],
            [
                'deadline_notification' => '2 days left',
                'task_created_notification' => '1',
                'task_completed_notification' => '0',
                'user_id' => 4,
            ],
            [
                'deadline_notification' => '1 day left',
                'task_created_notification' => '0',
                'task_completed_notification' => '1',
                'user_id' => 5,
            ],
            [
                'deadline_notification' => '10 days left',
                'task_created_notification' => '1',
                'task_completed_notification' => '1',
                'user_id' => 6,
            ],
            [
                'deadline_notification' => '7 days left',
                'task_created_notification' => '1',
                'task_completed_notification' => '0',
                'user_id' => 7,
            ],
            [
                'deadline_notification' => '14 days left',
                'task_created_notification' => '0',
                'task_completed_notification' => '1',
                'user_id' => 8,
            ],
            [
                'deadline_notification' => '4 days left',
                'task_created_notification' => '1',
                'task_completed_notification' => '1',
                'user_id' => 9,
            ],
            [
                'deadline_notification' => '8 days left',
                'task_created_notification' => '1',
                'task_completed_notification' => '0',
                'user_id' => 10,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }
}
