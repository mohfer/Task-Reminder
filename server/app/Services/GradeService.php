<?php

namespace App\Services;

use App\Models\Grade;
use Illuminate\Support\Collection;

class GradeService
{
    public function getAll(int $userId): Collection
    {
        return Grade::where('user_id', $userId)
            ->orderByRaw("\n                CASE grade\n                    WHEN 'A+' THEN 1\n                    WHEN 'A' THEN 2\n                    WHEN 'A-' THEN 3\n                    WHEN 'B+' THEN 4\n                    WHEN 'B' THEN 5\n                    WHEN 'B-' THEN 6\n                    WHEN 'C+' THEN 7\n                    WHEN 'C' THEN 8\n                    WHEN 'C-' THEN 9\n                    WHEN 'D+' THEN 10\n                    WHEN 'D' THEN 11\n                    WHEN 'D-' THEN 12\n                    WHEN 'E' THEN 13\n                    WHEN 'F' THEN 14\n                    ELSE 15\n                END\n            ")
            ->get()
            ->map(function ($grade) {
                return [
                    'id' => $grade->id,
                    'grade' => $grade->grade,
                    'grade_point' => number_format($grade->grade_point, 2),
                    'minimal_score' => number_format($grade->minimal_score, 2),
                    'maximal_score' => number_format($grade->maximal_score, 2),
                ];
            });
    }

    public function create(int $userId, array $data): Grade
    {
        return Grade::create([
            'grade' => $data['grade'],
            'grade_point' => $data['grade_point'],
            'minimal_score' => $data['minimal_score'],
            'maximal_score' => $data['maximal_score'],
            'user_id' => $userId,
        ]);
    }

    public function update(int $userId, int $id, array $data): Grade
    {
        $grade = Grade::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();

        $grade->update([
            'grade' => $data['grade'],
            'grade_point' => $data['grade_point'],
            'minimal_score' => $data['minimal_score'],
            'maximal_score' => $data['maximal_score'],
        ]);

        return $grade;
    }

    public function delete(int $userId, int $id): void
    {
        $grade = Grade::where('user_id', $userId)
            ->where('id', $id)
            ->firstOrFail();

        $grade->delete();
    }
}
