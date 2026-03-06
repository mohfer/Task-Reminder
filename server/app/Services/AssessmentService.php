<?php

namespace App\Services;

use App\Models\CourseContent;
use App\Models\Grade;

class AssessmentService
{
    public function calculateGpa(int $userId, ?string $selectedSemester): array
    {
        $grades = Grade::where('user_id', $userId)->get();

        $allCourseContents = CourseContent::where('user_id', $userId)
            ->orderBy('course_content', 'ASC')
            ->get();

        $semesters = $allCourseContents->pluck('semester')->unique();

        $mapGrade = function ($courseContent) use ($grades) {
            $grade = null;

            if ($courseContent->score !== null) {
                $grade = $grades->first(function ($g) use ($courseContent) {
                    return $courseContent->score >= $g->minimal_score
                        && $courseContent->score <= $g->maximal_score;
                });
            }

            return [
                'id' => $courseContent->id,
                'course_content' => $courseContent->course_content,
                'score' => $courseContent->score !== null ? number_format($courseContent->score, 2) : null,
                'credits' => $courseContent->credits,
                'grade' => $grade?->grade,
                'grade_point' => $grade?->grade_point ?? 0,
            ];
        };

        $groupedBySemester = $allCourseContents->groupBy('semester');

        $totalWeightedGradePointsAll = 0;
        $totalCreditsAll = 0;
        $gpaPerSemester = [];

        foreach ($groupedBySemester as $semester => $contents) {
            $mapped = $contents->map($mapGrade);
            $hasEmpty = $mapped->contains(fn($c) => $c['score'] === null);

            if (!$hasEmpty) {
                $weightedGradePoints = $mapped->sum(fn($c) => $c['grade_point'] * $c['credits']);
                $totalCredits = $mapped->sum('credits');
                $semesterGpa = $totalCredits > 0 ? $weightedGradePoints / $totalCredits : 0;

                $gpaPerSemester[$semester] = number_format($semesterGpa, 2);
                $totalWeightedGradePointsAll += $weightedGradePoints;
                $totalCreditsAll += $totalCredits;
            } else {
                $gpaPerSemester[$semester] = '0.00';
            }
        }

        $cumulativeGpa = $totalCreditsAll > 0 ? $totalWeightedGradePointsAll / $totalCreditsAll : 0;

        $selectedSemester = $selectedSemester ?? $semesters->last();
        $selectedContents = ($groupedBySemester[$selectedSemester] ?? collect())->map($mapGrade);

        $hasEmptySelected = $selectedContents->contains(fn($c) => $c['score'] === null);
        if (!$hasEmptySelected && $selectedContents->isNotEmpty()) {
            $weightedGradePoints = $selectedContents->sum(fn($c) => $c['grade_point'] * $c['credits']);
            $totalCredits = $selectedContents->sum('credits');
            $selectedGpa = $totalCredits > 0 ? number_format($weightedGradePoints / $totalCredits, 2) : '0.00';
        } else {
            $selectedGpa = '0.00';
        }

        return [
            'semester_gpa' => $selectedGpa,
            'cumulative_gpa' => number_format($cumulativeGpa, 2),
            'gpa_per_semester' => $gpaPerSemester,
            'course_contents' => $selectedContents->values(),
        ];
    }

    public function updateScore(int $userId, int $id, ?float $score): CourseContent
    {
        $courseContent = CourseContent::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();

        $courseContent->update([
            'score' => $score,
        ]);

        return $courseContent;
    }
}
