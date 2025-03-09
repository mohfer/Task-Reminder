<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Ramsey\Uuid\Type\Decimal;

class GradeController
{
    use ApiResponse;

    public function index(Request $request)
    {
        $user = $request->user()->id;

        $grades = Grade::where('user_id', $user)
            ->get()
            ->map(function ($grade) {
                return [
                    'id' => $grade->id,
                    'grade' => $grade->grade,
                    'quality_number' => (float) $grade->quality_number,
                    'minimal_score' => (float) $grade->minimal_score,
                    'maximal_score' => (float) $grade->maximal_score,
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
            'grade' => 'required',
            'quality_number' => 'required|numeric',
            'minimal_score' => 'required|numeric',
            'maximal_score' => 'required|numeric',
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
            'grade' => 'required',
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
