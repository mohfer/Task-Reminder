<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGradeRequest;
use App\Http\Requests\UpdateGradeRequest;
use App\Services\GradeService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

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

    public function store(StoreGradeRequest $request)
    {
        $grade = $this->gradeService->create($request->user()->id, $request->validated());

        return $this->sendResponse($grade, 'Grade created successfully', 201);
    }

    public function update(UpdateGradeRequest $request, $id)
    {
        try {
            $grade = $this->gradeService->update($request->user()->id, (int) $id, $request->validated());
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
