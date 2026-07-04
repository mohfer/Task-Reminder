<?php

namespace App\Http\Controllers;

use App\Services\AssessmentService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AssessmentController
{
    use ApiResponse;

    public function __construct(
        private readonly AssessmentService $assessmentService
    ) {}

    public function calculateGpa(Request $request)
    {
        $data = $this->assessmentService->calculateGpa($request->user()->id, $request->semester);

        return $this->sendResponse($data, 'Course contents, semester GPA, and cumulative GPA retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'score' => "nullable|numeric|min:0|max:100"
        ]);

        $courseContent = $this->assessmentService->updateScore($request->user()->id, (int) $id, $request->score);

        return $this->sendResponse($courseContent, 'Score updated successfully');
    }

    public function sync(Request $request)
    {
        $request->validate([
            'source_url' => ['required', 'string', 'regex:/^https?:\/\/.+/i'],
            'task_id' => 'required|integer|min:1',
            'semester' => 'nullable|string',
        ]);

        try {
            $result = $this->assessmentService->syncFromMonitoring(
                $request->user()->id,
                rtrim($request->source_url, '/'),
                (int) $request->task_id,
                $request->semester
            );
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 500);
        }

        return $this->sendResponse($result, "{$result['updated']} scores updated, " . count($result['skipped']) . " skipped");
    }
}
