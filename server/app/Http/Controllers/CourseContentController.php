<?php

namespace App\Http\Controllers;

use App\Http\Requests\ImportCourseContentRequest;
use App\Http\Requests\StoreCourseContentRequest;
use App\Http\Requests\SyncScheduleRequest;
use App\Http\Requests\UpdateCourseContentRequest;
use App\Services\CourseContentService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CourseContentController
{
    use ApiResponse;

    public function __construct(
        private readonly CourseContentService $courseContentService
    ) {}

    public function store(StoreCourseContentRequest $request)
    {
        try {
            $courseContent = $this->courseContentService->create($request->user()->id, $request->validated());
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 409);
        }

        return $this->sendResponse($courseContent, 'Course Content created successfully', 201);
    }

    public function update(UpdateCourseContentRequest $request, $id)
    {
        try {
            $courseContent = $this->courseContentService->update($request->user()->id, (int) $id, $request->validated());
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

    public function syncSchedule(SyncScheduleRequest $request)
    {
        try {
            $result = $this->courseContentService->syncScheduleFromSiakang(
                $request->user()->id,
                $request->validated()['semester'] ?? null,
                $request->validated()['source_semester'] ?? null
            );
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 500);
        }

        return $this->sendResponse(
            $result,
            "{$result['inserted']} schedules imported, ".count($result['skipped']).' skipped'
        );
    }

    public function downloadTemplate()
    {
        $filePath = public_path('templates/course_content_template.xlsx');

        if (! file_exists($filePath)) {
            return $this->sendError('Template file not found', 404);
        }

        return response()->download($filePath, 'course_content_template.xlsx');
    }

    public function importFromExcel(ImportCourseContentRequest $request)
    {
        try {
            $result = $this->courseContentService->importFromExcel($request->user()->id, $request->file('file'));

            return $this->sendResponse($result['data'], $result['message'], $result['status']);
        } catch (\RuntimeException $e) {
            [$message, $headingError] = explode('|', $e->getMessage(), 2);

            return $this->sendError($message, 422, ['headings' => $headingError]);
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), (int) $e->getCode() ?: 422);
        }
    }
}
