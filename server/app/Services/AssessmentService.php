<?php

namespace App\Services;

use App\Models\CourseContent;
use App\Models\Grade;
use App\Models\Setting;

class AssessmentService
{
    public function __construct(
        private readonly SiakangClient $siakangClient
    ) {}

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
            $hasEmpty = $mapped->contains(fn ($c) => $c['score'] === null);

            if (! $hasEmpty) {
                $weightedGradePoints = $mapped->sum(fn ($c) => $c['grade_point'] * $c['credits']);
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

        $hasEmptySelected = $selectedContents->contains(fn ($c) => $c['score'] === null);
        if (! $hasEmptySelected && $selectedContents->isNotEmpty()) {
            $weightedGradePoints = $selectedContents->sum(fn ($c) => $c['grade_point'] * $c['credits']);
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

    public function syncScoresFromSiakang(int $userId, ?string $targetSemester = null, ?string $sourceSemester = null): array
    {
        $setting = Setting::where('user_id', $userId)->first();

        if (! $setting?->hasSiakangCredentials()) {
            throw new \Exception('Siakang credentials are not configured. Add them in Settings.', 422);
        }

        $response = $this->siakangClient->getGrades(
            trim($setting->siakang_email),
            trim($setting->siakang_password),
            $sourceSemester
        );

        if (($response['code'] ?? 0) !== 200) {
            throw new \Exception($response['message'] ?? 'Failed to fetch grades from Siakang.', (int) ($response['code'] ?: 502));
        }

        $data = $response['data'] ?? [];

        if (empty($data['courses']) || ! is_array($data['courses'])) {
            throw new \Exception('No grade data found in Siakang response.', 422);
        }

        $userCourses = CourseContent::where('user_id', $userId)
            ->when($targetSemester, fn ($q) => $q->where('semester', $targetSemester))
            ->get();

        $updated = 0;
        $unchanged = 0;
        $noMatch = [];

        foreach ($data['courses'] as $course) {
            $name = trim($course['name'] ?? '');
            $score = $course['score'] ?? null;

            // Only sync published numeric scores
            if ($name === '' || $score === null || ! is_numeric($score)) {
                if ($name !== '') {
                    $noMatch[] = $name.' (nilai belum keluar)';
                }

                continue;
            }

            $numericScore = (float) $score;

            $matkulName = trim(preg_replace('/\s*\([^)]*\)\s*$/', '', $name));

            // 1. Exact match first
            $courseContent = $userCourses->first(function ($c) use ($name) {
                return strcasecmp(trim($c->course_content), $name) === 0;
            });

            // 2. Match by extracted name (both sides stripped of parentheticals)
            if (! $courseContent) {
                $courseContent = $userCourses->first(function ($c) use ($matkulName) {
                    $localName = trim(preg_replace('/\s*\([^)]*\)\s*$/', '', $c->course_content));

                    return strcasecmp($localName, $matkulName) === 0;
                });
            }

            // 3. Fuzzy: Siakang course name is contained in local course_content (or vice versa)
            if (! $courseContent && $matkulName !== '') {
                $courseContent = $userCourses->first(function ($c) use ($matkulName) {
                    $localName = trim(preg_replace('/\s*\([^)]*\)\s*$/', '', $c->course_content));

                    return stripos($c->course_content, $matkulName) !== false
                        || stripos($matkulName, $localName) !== false;
                });
            }

            if (! $courseContent) {
                $noMatch[] = $name;

                continue;
            }

            $existingScore = $courseContent->score === null ? null : (float) $courseContent->score;
            $isSame = $existingScore !== null && abs($existingScore - $numericScore) < 0.0001;

            if ($isSame) {
                $unchanged++;

                continue;
            }

            $courseContent->update(['score' => $numericScore]);
            $updated++;
        }

        return [
            'updated' => $updated,
            'unchanged' => $unchanged,
            'no_match' => $noMatch,
            'semester_label' => $targetSemester,
            'ip' => $data['ip'] ?? null,
            'ipk' => $data['ipk'] ?? null,
        ];
    }
}
