<?php

namespace App\Http\Controllers;

use App\Services\CourseContentService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CourseContentController
{
    use ApiResponse;

    public function __construct(
        private readonly CourseContentService $courseContentService
    ) {}

    public function store(Request $request)
    {
        $request->validate([
            'semester' => 'required',
            'code' => 'required',
            'course_content' => 'required',
            'credits' => 'required|integer|min:1',
            'lecturer' => 'required',
            'day' => 'required',
            'hour_start' => 'required',
            'hour_end' => 'required',
        ]);

        try {
            $courseContent = $this->courseContentService->create($request->user()->id, $request->all());
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 409);
        }

        return $this->sendResponse($courseContent, 'Course Content created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'semester' => 'required',
            'code' => 'required',
            'course_content' => 'required',
            'credits' => 'required|integer|min:1',
            'lecturer' => 'required',
            'day' => 'required',
            'hour_start' => 'required',
            'hour_end' => 'required',
        ]);

        try {
            $courseContent = $this->courseContentService->update($request->user()->id, (int) $id, $request->all());
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 404);
        }

        return $this->sendResponse($courseContent, 'Course Content updated successfully');
    }

    public function destroy(Request $request, $id)
    {
        try {
            $this->courseContentService->delete($request->user()->id, (int) $id);
        } catch (\Exception $e) {
            return $this->sendError('Course Content not found', 404);
        }

        return $this->sendResponse(null, 'Course Content deleted successfully');
    }

    public function filter(Request $request)
    {
        $data = $this->courseContentService->filter($request->user()->id, (string) $request->semester);

        return $this->sendResponse($data, 'Course Contents retrieved successfully');
    }

    public function downloadTemplate()
    {
        $filePath = public_path('templates/course_content_template.xlsx');

        if (!file_exists($filePath)) {
            return $this->sendError('Template file not found', 404);
        }

        return response()->download($filePath, 'course_content_template.xlsx');
    }

    public function importFromExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120',
        ]);

        try {
            $result = $this->courseContentService->importFromExcel($request->user()->id, $request->file('file'));

            return response()->json([
                'code' => $result['status'],
                'message' => $result['message'],
                'data' => $result['data'],
            ], $result['status']);
        } catch (\RuntimeException $e) {
            [$message, $headingError] = explode('|', $e->getMessage(), 2);

            return response()->json([
                'code' => 422,
                'message' => $message,
                'errors' => [
                    'headings' => $headingError,
                ],
            ], 422);
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 422);
        }
    }
}
