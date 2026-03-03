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
                'credits' => 3,
                'lecturer' => 'Prof. John Doe',
                'day' => 'Monday',
                'hour_start' => '08:00',
                'hour_end' => '10:00',
                'score' => 85,
                'user_id' => 1
            ],
            [
                'semester' => 'Semester 1',
                'code' => 'COURSE111',
                'course_content' => 'Mathematics for CS',
                'credits' => 3,
                'lecturer' => 'Prof. Alice Brown',
                'day' => 'Tuesday',
                'hour_start' => '10:00',
                'hour_end' => '12:00',
                'score' => 78,
                'user_id' => 1
            ],
            [
                'semester' => 'Semester 1',
                'code' => 'COURSE112',
                'course_content' => 'Physics for CS',
                'credits' => 2,
                'lecturer' => 'Prof. John Wick',
                'day' => 'Wednesday',
                'hour_start' => '13:00',
                'hour_end' => '15:00',
                'score' => 92,
                'user_id' => 1
            ],
            [
                'semester' => 'Semester 1',
                'code' => 'COURSE113',
                'course_content' => 'Computer Ethics',
                'credits' => 2,
                'lecturer' => 'Prof. Marie Curie',
                'day' => 'Thursday',
                'hour_start' => '10:00',
                'hour_end' => '12:00',
                'score' => 88,
                'user_id' => 1
            ],
            [
                'semester' => 'Semester 1',
                'code' => 'COURSE114',
                'course_content' => 'Basic Networking',
                'credits' => 3,
                'lecturer' => 'Prof. Tesla Stark',
                'day' => 'Friday',
                'hour_start' => '09:00',
                'hour_end' => '11:00',
                'score' => 75,
                'user_id' => 1
            ],

            [
                'semester' => 'Semester 2',
                'code' => 'COURSE456',
                'course_content' => 'Advanced Programming',
                'credits' => 4,
                'lecturer' => 'Prof. Jane Smith',
                'day' => 'Wednesday',
                'hour_start' => '13:00',
                'hour_end' => '15:00',
                'score' => 82,
                'user_id' => 1
            ],
            [
                'semester' => 'Semester 2',
                'code' => 'COURSE211',
                'course_content' => 'Data Analytics',
                'credits' => 3,
                'lecturer' => 'Prof. Ada Lovelace',
                'day' => 'Monday',
                'hour_start' => '08:00',
                'hour_end' => '10:00',
                'score' => 90,
                'user_id' => 1
            ],
            [
                'semester' => 'Semester 2',
                'code' => 'COURSE212',
                'course_content' => 'Software Engineering',
                'credits' => 4,
                'lecturer' => 'Prof. Grace Hopper',
                'day' => 'Tuesday',
                'hour_start' => '10:00',
                'hour_end' => '12:00',
                'score' => 95,
                'user_id' => 1
            ],
            [
                'semester' => 'Semester 2',
                'code' => 'COURSE213',
                'course_content' => 'Web Development',
                'credits' => 3,
                'lecturer' => 'Prof. Tim Berners-Lee',
                'day' => 'Thursday',
                'hour_start' => '09:00',
                'hour_end' => '11:00',
                'score' => 87,
                'user_id' => 1
            ],
            [
                'semester' => 'Semester 2',
                'code' => 'COURSE214',
                'course_content' => 'Mobile Development',
                'credits' => 3,
                'lecturer' => 'Prof. Linus Torvalds',
                'day' => 'Friday',
                'hour_start' => '14:00',
                'hour_end' => '16:00',
                'score' => 84,
                'user_id' => 1
            ],

            [
                'semester' => 'Semester 3',
                'code' => 'COURSE789',
                'course_content' => 'Data Structures',
                'credits' => 3,
                'lecturer' => 'Prof. Michael Green',
                'day' => 'Friday',
                'hour_start' => '10:00',
                'hour_end' => '12:00',

                'user_id' => 1
            ],
            [
                'semester' => 'Semester 3',
                'code' => 'COURSE311',
                'course_content' => 'Algorithms',
                'credits' => 3,
                'lecturer' => 'Prof. Sarah Lee',
                'day' => 'Monday',
                'hour_start' => '08:00',
                'hour_end' => '10:00',

                'user_id' => 1
            ],
            [
                'semester' => 'Semester 3',
                'code' => 'COURSE312',
                'course_content' => 'Artificial Intelligence',
                'credits' => 4,
                'lecturer' => 'Prof. Andrew Ng',
                'day' => 'Tuesday',
                'hour_start' => '13:00',
                'hour_end' => '15:00',

                'user_id' => 1
            ],
            [
                'semester' => 'Semester 3',
                'code' => 'COURSE313',
                'course_content' => 'Machine Learning',
                'credits' => 4,
                'lecturer' => 'Prof. Geoffrey Hinton',
                'day' => 'Wednesday',
                'hour_start' => '10:00',
                'hour_end' => '12:00',

                'user_id' => 1
            ],
            [
                'semester' => 'Semester 3',
                'code' => 'COURSE314',
                'course_content' => 'Big Data',
                'credits' => 3,
                'lecturer' => 'Prof. Yann LeCun',
                'day' => 'Thursday',
                'hour_start' => '09:00',
                'hour_end' => '11:00',

                'user_id' => 1
            ]
        ];

        foreach ($courseContents as $courseContent) {
            CourseContent::create($courseContent);
        }
    }
}
