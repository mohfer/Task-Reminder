<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CourseContent;

class CourseContentSeeder extends Seeder
{
    public function run()
    {
        $courseContents = [
            [
                'semester' => 'Semester 1',
                'code' => 'COURSE123',
                'course_content' => 'Introduction to Programming',
                'scu' => 3,
                'lecturer' => 'Prof. John Doe',
                'day' => 'Monday',
                'hour_start' => '08:00',
                'hour_end' => '10:00',
                'user_id' => 1
            ],
            [
                'semester' => 'Semester 2',
                'code' => 'COURSE456',
                'course_content' => 'Advanced Programming',
                'scu' => 4,
                'lecturer' => 'Prof. Jane Smith',
                'day' => 'Wednesday',
                'hour_start' => '13:00',
                'hour_end' => '15:00',
                'user_id' => 1
            ],
            [
                'semester' => 'Semester 3',
                'code' => 'COURSE789',
                'course_content' => 'Data Structures',
                'scu' => 3,
                'lecturer' => 'Prof. Michael Green',
                'day' => 'Friday',
                'hour_start' => '10:00',
                'hour_end' => '12:00',
                'user_id' => 1
            ],
            [
                'semester' => 'Semester 1',
                'code' => 'COURSE321',
                'course_content' => 'Introduction to Algorithms',
                'scu' => 3,
                'lecturer' => 'Prof. Sarah Lee',
                'day' => 'Tuesday',
                'hour_start' => '09:00',
                'hour_end' => '11:00',
                'user_id' => 2
            ],
            [
                'semester' => 'Semester 2',
                'code' => 'COURSE654',
                'course_content' => 'Operating Systems',
                'scu' => 4,
                'lecturer' => 'Prof. Alan Brown',
                'day' => 'Thursday',
                'hour_start' => '14:00',
                'hour_end' => '16:00',
                'user_id' => 2
            ],
            [
                'semester' => 'Semester 3',
                'code' => 'COURSE987',
                'course_content' => 'Database Management',
                'scu' => 3,
                'lecturer' => 'Prof. Emma White',
                'day' => 'Friday',
                'hour_start' => '08:00',
                'hour_end' => '10:00',
                'user_id' => 2
            ]
        ];

        foreach ($courseContents as $courseContent) {
            CourseContent::create($courseContent);
        }
    }
}
