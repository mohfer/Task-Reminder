<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Faker\Factory as Faker;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        $taskNames = [
            'Presentation', 'Assignment', 'Midterm Exam', 'Group Project', 'Quiz',
            'Lab Report', 'Final Project', 'Research Paper', 'Oral Exam', 'Project Proposal',
            'Thesis Submission', 'Literature Review', 'Field Study', 'Final Exam',
            'Internship Report', 'Capstone Project', 'Course Feedback', 'Peer Review',
            'Portfolio Submission', 'Case Study', 'Technical Report', 'Code Review'
        ];
        
        $tasks = [];
        
        // Generate random tasks
        for ($i = 0; $i < 20; $i++) {
            $tasks[] = [
                'task' => $faker->randomElement($taskNames) . ' ' . $faker->numberBetween(1, 5),
                'deadline' => $faker->dateTimeBetween('now', '+3 months')->format('Y-m-d'),
                'status' => $faker->numberBetween(0, 1),
                'user_id' => 1,
                'course_content_id' => $faker->numberBetween(1, 10),
            ];
        }
        
        // Add 5 specific tasks for the 25th of the current month
        $date25 = Carbon::now()->day(25)->format('Y-m-d');
        
        $specificTasks = [
            'Important Presentation',
            'Critical Assignment',
            'Team Project Submission',
            'Progress Report',
            'Monthly Review'
        ];
        
        foreach ($specificTasks as $taskName) {
            $tasks[] = [
                'task' => $taskName,
                'deadline' => $date25,
                'status' => $faker->numberBetween(0, 1),
                'user_id' => 1,
                'course_content_id' => $faker->numberBetween(1, 10),
            ];
        }
        
        foreach ($tasks as $task) {
            Task::create($task);
        }
    }
}
