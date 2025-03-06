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
                'deadline' => '2025-02-10',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 1,
            ],
            [
                'task' => 'Assignment 1',
                'deadline' => '2025-02-15',
                'status' => 1,
                'user_id' => 1,
                'course_content_id' => 2,
            ],
            [
                'task' => 'Midterm Exam',
                'deadline' => '2025-02-20',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 3,
            ],
            [
                'task' => 'Group Project',
                'deadline' => '2025-02-25',
                'status' => 1,
                'user_id' => 1,
                'course_content_id' => 4,
            ],
            [
                'task' => 'Quiz 1',
                'deadline' => '2025-02-28',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 5,
            ],
            [
                'task' => 'Lab Report',
                'deadline' => '2025-03-05',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 6,
            ],
            [
                'task' => 'Final Project',
                'deadline' => '2025-03-10',
                'status' => 1,
                'user_id' => 1,
                'course_content_id' => 7,
            ],
            [
                'task' => 'Weekly Quiz',
                'deadline' => '2025-03-15',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 8,
            ],
            [
                'task' => 'Research Paper',
                'deadline' => '2025-03-20',
                'status' => 1,
                'user_id' => 1,
                'course_content_id' => 9,
            ],
            [
                'task' => 'Oral Exam',
                'deadline' => '2025-03-25',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 10,
            ],
            [
                'task' => 'Project Proposal',
                'deadline' => '2025-03-30',
                'status' => 1,
                'user_id' => 1,
                'course_content_id' => 1,
            ],
            [
                'task' => 'Thesis Submission',
                'deadline' => '2025-04-05',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 2,
            ],
            [
                'task' => 'Literature Review',
                'deadline' => '2025-04-10',
                'status' => 1,
                'user_id' => 1,
                'course_content_id' => 3,
            ],
            [
                'task' => 'Field Study',
                'deadline' => '2025-04-15',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 4,
            ],
            [
                'task' => 'Final Exam',
                'deadline' => '2025-04-20',
                'status' => 1,
                'user_id' => 1,
                'course_content_id' => 5,
            ],
            [
                'task' => 'Internship Report',
                'deadline' => '2025-04-25',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 6,
            ],
            [
                'task' => 'Capstone Project',
                'deadline' => '2025-04-30',
                'status' => 1,
                'user_id' => 1,
                'course_content_id' => 7,
            ],
            [
                'task' => 'Course Feedback',
                'deadline' => '2025-04-30',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 8,
            ],
            [
                'task' => 'Peer Review',
                'deadline' => '2025-04-30',
                'status' => 1,
                'user_id' => 1,
                'course_content_id' => 9,
            ],
            [
                'task' => 'Final Presentation',
                'deadline' => '2025-04-30',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 10,
            ],
            [
                'task' => 'Graduation Application',
                'deadline' => '2025-04-30',
                'status' => 1,
                'user_id' => 1,
                'course_content_id' => 1,
            ],
            [
                'task' => 'Job Application',
                'deadline' => '2025-04-30',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 2,
            ],
            [
                'task' => 'Networking Event',
                'deadline' => '2025-04-30',
                'status' => 1,
                'user_id' => 1,
                'course_content_id' => 3,
            ],
            [
                'task' => 'Portfolio Submission',
                'deadline' => '2025-04-30',
                'status' => 0,
                'user_id' => 1,
                'course_content_id' => 4,
            ],
        ];

        foreach ($tasks as $task) {
            Task::create($task);
        }
    }
}
