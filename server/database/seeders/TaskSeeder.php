<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tasks = [
            [
                'task' => 'Presentation',
                'deadline' => '2024-11-10',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 1,
            ],
            [
                'task' => 'Assignment 1',
                'deadline' => '2024-11-15',
                'status' => 1,
                'user_id' => 1,
                'course_content_id' => 2,
            ],
            [
                'task' => 'Midterm Exam',
                'deadline' => '2024-11-20',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 3,
            ],
            [
                'task' => 'Group Project',
                'deadline' => '2024-11-25',
                'status' => 1,
                'user_id' => 1,
                'course_content_id' => 4,
            ],
            [
                'task' => 'Quiz 1',
                'deadline' => '2024-11-30',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 5,
            ],
            [
                'task' => 'Lab Report',
                'deadline' => '2024-12-05',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 6,
            ],
            [
                'task' => 'Final Project',
                'deadline' => '2024-12-10',
                'status' => 1,
                'user_id' => 1,
                'course_content_id' => 7,
            ],
            [
                'task' => 'Weekly Quiz',
                'deadline' => '2024-12-15',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 8,
            ],
            [
                'task' => 'Research Paper',
                'deadline' => '2024-12-20',
                'status' => 1,
                'user_id' => 1,
                'course_content_id' => 9,
            ],
            [
                'task' => 'Oral Exam',
                'deadline' => '2024-12-25',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 10,
            ],
        ];

        foreach ($tasks as $task) {
            Task::create($task);
        }
    }
}
