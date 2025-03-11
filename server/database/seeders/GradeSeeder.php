<?php

namespace Database\Seeders;

use App\Models\Grade;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class GradeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $grades = [
            [
                'grade' => 'A',
                'quality_number' => 4.00,
                'minimal_score' => 85.00,
                'maximal_score' => 100.00,
                'user_id' => 1,
            ],
            [
                'grade' => 'A-',
                'quality_number' => 3.75,
                'minimal_score' => 80.00,
                'maximal_score' => 84.99,
                'user_id' => 1,
            ],
            [
                'grade' => 'B+',
                'quality_number' => 3.50,
                'minimal_score' => 75.00,
                'maximal_score' => 79.99,
                'user_id' => 1,
            ],
            [
                'grade' => 'B',
                'quality_number' => 3.00,
                'minimal_score' => 70.00,
                'maximal_score' => 74.99,
                'user_id' => 1,
            ],
            [
                'grade' => 'B-',
                'quality_number' => 2.75,
                'minimal_score' => 65.00,
                'maximal_score' => 69.99,
                'user_id' => 1,
            ],
            [
                'grade' => 'C+',
                'quality_number' => 2.50,
                'minimal_score' => 60.00,
                'maximal_score' => 64.99,
                'user_id' => 1,
            ],
            [
                'grade' => 'C',
                'quality_number' => 2.00,
                'minimal_score' => 56.00,
                'maximal_score' => 59.99,
                'user_id' => 1,
            ],
            [
                'grade' => 'D',
                'quality_number' => 1.00,
                'minimal_score' => 50.00,
                'maximal_score' => 55.99,
                'user_id' => 1,
            ],
            [
                'grade' => 'E',
                'quality_number' => 0.00,
                'minimal_score' => 0.00,
                'maximal_score' => 49.99,
                'user_id' => 1,
            ],
        ];

        foreach ($grades as $grade) {
            Grade::create($grade);
        }
    }
}
