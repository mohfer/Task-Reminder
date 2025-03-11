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

        $semesters = CourseContent::where('user_id', $user)
            ->distinct('semester')
            ->pluck('semester');

        $totalQualityNumberTimesSCUAllSemesters = 0;
        $totalSCUAllSemesters = 0;

        $ipsPerSemester = [];
        $semestersWithCompleteScores = [];

        foreach ($semesters as $semester) {
            $courseContents = CourseContent::where('user_id', $user)
                ->where('semester', $semester)
                ->get();

            $hasEmptyScores = $courseContents->contains(function ($courseContent) {
                return $courseContent->score === null;
            });

            $courseContentsFormatted = $courseContents->map(function ($courseContent) use ($grades) {
                $grade = null;
                if ($courseContent->score !== null) {
                    $grade = $grades->first(function ($grade) use ($courseContent) {
                        return $courseContent->score >= $grade->minimal_score && $courseContent->score <= $grade->maximal_score;
                    });
                }

                return [
                    'course_content' => $courseContent->course_content,
                    'score' => $courseContent->score !== null ? number_format($courseContent->score, 2) : null,
                    'scu' => $courseContent->scu,
                    'grade' => $grade ? $grade->grade : null,
                    'quality_number' => $grade ? $grade->quality_number : 0,
                ];
            });

            if (!$hasEmptyScores) {
                $totalQualityNumberTimesSCU = $courseContentsFormatted->sum(function ($courseContent) {
                    return $courseContent['quality_number'] * $courseContent['scu'];
                });

                $totalSCU = $courseContentsFormatted->sum('scu');

                $ips = $totalSCU > 0 ? $totalQualityNumberTimesSCU / $totalSCU : 0;

                $ipsPerSemester[$semester] = number_format($ips, 2);

                $totalQualityNumberTimesSCUAllSemesters += $totalQualityNumberTimesSCU;
                $totalSCUAllSemesters += $totalSCU;

                $semestersWithCompleteScores[] = $semester;
            } else {
                $ipsPerSemester[$semester] = "0.00";
            }
        }

        $ipk = $totalSCUAllSemesters > 0 ? $totalQualityNumberTimesSCUAllSemesters / $totalSCUAllSemesters : 0;

        $selectedSemester = $selectedSemester ?? $semesters->last();
        $courseContentsSelectedSemester = CourseContent::where('user_id', $user)
            ->where('semester', $selectedSemester)
            ->orderBy('course_content', 'ASC')
            ->get()
            ->map(function ($courseContent) use ($grades) {
                $grade = null;
                if ($courseContent->score !== null) {
                    $grade = $grades->first(function ($grade) use ($courseContent) {
                        return $courseContent->score >= $grade->minimal_score && $courseContent->score <= $grade->maximal_score;
                    });
                }

                return [
                    'id' => $courseContent->id,
                    'course_content' => $courseContent->course_content,
                    'score' => $courseContent->score !== null ? number_format($courseContent->score, 2) : null,
                    'scu' => $courseContent->scu,
                    'grade' => $grade ? $grade->grade : null,
                    'quality_number' => $grade ? $grade->quality_number : 0,
                ];
            });

        $hasEmptyScoresInSelectedSemester = $courseContentsSelectedSemester->contains(function ($courseContent) {
            return $courseContent['score'] === null;
        });

        $ipsSelectedSemester = null;
        if (!$hasEmptyScoresInSelectedSemester) {
            $totalQualityNumberTimesSCUSelectedSemester = $courseContentsSelectedSemester->sum(function ($courseContent) {
                return $courseContent['quality_number'] * $courseContent['scu'];
            });

            $totalSCUSelectedSemester = $courseContentsSelectedSemester->sum('scu');

            $ipsSelectedSemester = $totalSCUSelectedSemester > 0 ? $totalQualityNumberTimesSCUSelectedSemester / $totalSCUSelectedSemester : 0;
            $ipsSelectedSemester = number_format($ipsSelectedSemester, 2);
        } else {
            $ipsSelectedSemester = "0.00";
        }

        $data = [
            'ips' => $ipsSelectedSemester,
            'ipk' => number_format($ipk, 2),
            'ips_per_semester' => $ipsPerSemester,
            'course_contents' => $courseContentsSelectedSemester,
        ];

        return $this->sendResponse($data, 'Course contents, IPS, and IPK retrieved successfully');
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

        $request['user_id'] = $user;

        $courseContent->update($request->all());

        return $this->sendResponse($courseContent, 'Score updated successfully');
    }
}
