<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GradeController
{
    use ApiResponse;

    public function index(Request $request)
    {
        $user = $request->user()->id;

        $grades = Grade::where('user_id', $user)
            ->orderByRaw("
                CASE grade
                    WHEN 'A+' THEN 1
                    WHEN 'A' THEN 2
                    WHEN 'A-' THEN 3
                    WHEN 'B+' THEN 4
                    WHEN 'B' THEN 5
                    WHEN 'B-' THEN 6
                    WHEN 'C+' THEN 7
                    WHEN 'C' THEN 8
                    WHEN 'C-' THEN 9
                    WHEN 'D+' THEN 10
                    WHEN 'D' THEN 11
                    WHEN 'D-' THEN 12
                    WHEN 'E' THEN 13
                    WHEN 'F' THEN 14
                    ELSE 15
                END
            ")
            ->get()
            ->map(function ($grade) {
                return [
                    'id' => $grade->id,
                    'grade' => $grade->grade,
                    'quality_number' => number_format($grade->quality_number, 2),
                    'minimal_score' => number_format($grade->minimal_score, 2),
                    'maximal_score' => number_format($grade->maximal_score, 2),
                ];
            });

        return $this->sendResponse($grades, 'Grades retrieved successfully');
    }

    public function store(Request $request)
    {
        $user = $request->user()->id;

        $gradeExist = Grade::where('grade', $request->grade)->where('user_id', $user)->exists();

        if ($gradeExist) {
            return $this->sendError('Grade Already Added', 409);
        }

        $request->validate([
            'grade' => ['required', Rule::unique('grades')->where(fn($query) => $query->where('user_id', $user))->ignore($request->id),],
            'quality_number' => 'required|numeric',
            'minimal_score' => 'required|numeric|min:0|max:100',
            'maximal_score' => 'required|numeric|min:0|max:100',
        ]);

        $request['user_id'] = $user;
        $grade = Grade::create($request->all());
        return $this->sendResponse($grade, 'Grade created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user()->id;

        $grade = Grade::where('id', $id)
            ->where('user_id', $user)
            ->first();

        if (!$grade) {
            return $this->sendError('Grade not found', 404);
        }

        $request->validate([
            'grade' => ['required', Rule::unique('grades')->where(fn($query) => $query->where('user_id', $user))->ignore($id),],
            'quality_number' => 'required|numeric',
            'minimal_score' => 'required|numeric',
            'maximal_score' => 'required|numeric',
        ]);

        $request['user_id'] = $user;
        $grade->update($request->all());
        return $this->sendResponse($grade, 'Grade updated successfully', 201);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user()->id;

        $grade = Grade::where('user_id', $user)->where('id', $id)->first();

        if (!$grade) {
            return $this->sendError('Grade not found', 404);
        }

        $grade->delete();

        return $this->sendResponse(null, 'Grade deleted successfully');
    }
}
