<?php

namespace App\Http\Controllers;

use App\Services\GradeService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GradeController
{
    use ApiResponse;

    public function __construct(
        private readonly GradeService $gradeService
    ) {}

    public function index(Request $request)
    {
        $grades = $this->gradeService->getAll($request->user()->id);

        return $this->sendResponse($grades, 'Grades retrieved successfully');
    }

    public function store(Request $request)
    {
        $request->validate([
            'grade' => ['required', Rule::unique('grades')->where(fn($query) => $query->where('user_id', $request->user()->id))],
            'grade_point' => 'required|numeric',
            'minimal_score' => 'required|numeric|min:0|max:100',
            'maximal_score' => 'required|numeric|min:0|max:100',
        ]);

        $grade = $this->gradeService->create($request->user()->id, $request->all());

        return $this->sendResponse($grade, 'Grade created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'grade' => ['required', Rule::unique('grades')->where(fn($query) => $query->where('user_id', $request->user()->id))->ignore($id)],
            'grade_point' => 'required|numeric',
            'minimal_score' => 'required|numeric',
            'maximal_score' => 'required|numeric',
        ]);

        try {
            $grade = $this->gradeService->update($request->user()->id, (int) $id, $request->all());
        } catch (\Exception) {
            return $this->sendError('Grade not found', 404);
        }

        return $this->sendResponse($grade, 'Grade updated successfully', 200);
    }

    public function destroy(Request $request, $id)
    {
        try {
            $this->gradeService->delete($request->user()->id, (int) $id);
        } catch (\Exception) {
            return $this->sendError('Grade not found', 404);
        }

        return $this->sendResponse(null, 'Grade deleted successfully');
    }
}
