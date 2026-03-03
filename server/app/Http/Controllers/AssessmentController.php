<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Models\CourseContent;

class AssessmentController
{
    use ApiResponse;

    public function calculateGpa(Request $request)
    {
        $user = $request->user()->id;
        $selectedSemester = $request->semester;

        $grades = Grade::where('user_id', $user)->get();

        $allCourseContents = CourseContent::where('user_id', $user)
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

        return $this->sendResponse([
            'semester_gpa' => $selectedGpa,
            'cumulative_gpa' => number_format($cumulativeGpa, 2),
            'gpa_per_semester' => $gpaPerSemester,
            'course_contents' => $selectedContents->values(),
        ], 'Course contents, semester GPA, and cumulative GPA retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $user = $request->user()->id;

        $courseContent = CourseContent::where('id', $id)
            ->where('user_id', $user)
            ->first();

        if (!$courseContent) {
            return $this->sendError('Course Content not found', 404);
        }

        $request->validate([
            'score' => "nullable|numeric|min:0|max:100"
        ]);

        $courseContent->update([
            'score' => $request->score,
        ]);

        return $this->sendResponse($courseContent, 'Score updated successfully');
    }
}
