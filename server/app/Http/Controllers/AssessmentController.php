<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Models\CourseContent;

class AssessmentController
{
    use ApiResponse;

    public function calculateIp(Request $request)
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
                'scu' => $courseContent->scu,
                'grade' => $grade?->grade,
                'quality_number' => $grade?->quality_number ?? 0,
            ];
        };

        $groupedBySemester = $allCourseContents->groupBy('semester');

        $totalQualityTimesSCUAll = 0;
        $totalSCUAll = 0;
        $ipsPerSemester = [];

        foreach ($groupedBySemester as $semester => $contents) {
            $mapped = $contents->map($mapGrade);
            $hasEmpty = $mapped->contains(fn($c) => $c['score'] === null);

            if (!$hasEmpty) {
                $qualityTimesSCU = $mapped->sum(fn($c) => $c['quality_number'] * $c['scu']);
                $totalSCU = $mapped->sum('scu');
                $ips = $totalSCU > 0 ? $qualityTimesSCU / $totalSCU : 0;

                $ipsPerSemester[$semester] = number_format($ips, 2);
                $totalQualityTimesSCUAll += $qualityTimesSCU;
                $totalSCUAll += $totalSCU;
            } else {
                $ipsPerSemester[$semester] = '0.00';
            }
        }

        $ipk = $totalSCUAll > 0 ? $totalQualityTimesSCUAll / $totalSCUAll : 0;

        $selectedSemester = $selectedSemester ?? $semesters->last();
        $selectedContents = ($groupedBySemester[$selectedSemester] ?? collect())->map($mapGrade);

        $hasEmptySelected = $selectedContents->contains(fn($c) => $c['score'] === null);
        if (!$hasEmptySelected && $selectedContents->isNotEmpty()) {
            $qualityTimesSCU = $selectedContents->sum(fn($c) => $c['quality_number'] * $c['scu']);
            $totalSCU = $selectedContents->sum('scu');
            $ipsSelected = $totalSCU > 0 ? number_format($qualityTimesSCU / $totalSCU, 2) : '0.00';
        } else {
            $ipsSelected = '0.00';
        }

        return $this->sendResponse([
            'ips' => $ipsSelected,
            'ipk' => number_format($ipk, 2),
            'ips_per_semester' => $ipsPerSemester,
            'course_contents' => $selectedContents->values(),
        ], 'Course contents, IPS, and IPK retrieved successfully');
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
