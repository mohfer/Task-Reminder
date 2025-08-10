<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Models\CourseContent;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\CourseContentsImport;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CourseContentController
{
    use ApiResponse;

    public function store(Request $request)
    {
        $user = $request->user()->id;
        $code = CourseContent::where('code', $request->code)->where('user_id', $user)->where('semester', $request->semester)->exists();
        $courseContent = CourseContent::where('course_content', $request->course_content)->where('user_id', $user)->where('semester', $request->semester)->exists();

        if ($code || $courseContent) {
            return $this->sendError('Course Content Already Added', 409);
        }

        $request->validate([
            'semester' => 'required',
            'code' => 'required',
            'course_content' => 'required',
            'scu' => 'required|integer|min:1',
            'lecturer' => 'required',
            'day' => 'required',
            'hour_start' => 'required',
            'hour_end' => 'required',
        ]);

        $request['user_id'] = $user;
        $courseContent = CourseContent::create($request->all());
        return $this->sendResponse($courseContent, 'Course Content created successfully', 201);
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
            'semester' => 'required',
            'code' => 'required',
            'course_content' => 'required',
            'scu' => 'required|integer|min:1',
            'lecturer' => 'required',
            'day' => 'required',
            'hour_start' => 'required',
            'hour_end' => 'required',
        ]);

        $existingCode = CourseContent::where('user_id', $user)
            ->where('id', '!=', $id)
            ->where('code', $request->code)
            ->where('semester', $request->semester)
            ->exists();

        if ($existingCode) {
            return $this->sendError('Code already exists for this user', 409);
        }

        $existingContent = CourseContent::where('user_id', $user)
            ->where('id', '!=', $id)
            ->where('course_content', $request->course_content)
            ->where('semester', $request->semester)
            ->exists();

        if ($existingContent) {
            return $this->sendError('Course Content already exists for this user', 409);
        }

        $request['user_id'] = $user;

        $courseContent->update($request->all());

        return $this->sendResponse($courseContent, 'Course Content updated successfully');
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user()->id;

        $courseContent = CourseContent::where('id', $id)->where('user_id', $user)->first();;

        if (!$courseContent) {
            return $this->sendError('Course Content not found', 404);
        }

        $courseContent->delete();

        return $this->sendResponse(null, 'Course Content deleted successfully');
    }

    public function filter(Request $request)
    {
        $user = $request->user()->id;

        $courseContents = CourseContent::where('user_id', $user)
            ->where('semester', $request->semester)
            ->orderBy('course_content', 'ASC')
            ->get()
            ->map(function ($courseContent) {
                return [
                    'id' => $courseContent->id,
                    'semester' => $courseContent->semester,
                    'code' => $courseContent->code,
                    'course_content' => $courseContent->course_content,
                    'scu' => $courseContent->scu,
                    'lecturer' => $courseContent->lecturer,
                    'day' => $courseContent->day,
                    'hour_start' => date('H:i', strtotime($courseContent->hour_start)),
                    'hour_end' => date('H:i', strtotime($courseContent->hour_end)),
                    'scu_total' => $courseContent->scu
                ];
            });

        $totalScu = $courseContents->sum('scu_total');

        if (!$courseContents) {
            return $this->sendError('Course Content not found', 404);
        }

        $data = [
            'total_scu' => $totalScu,
            'course_contents' => $courseContents,
        ];

        return response()->json([
            'message' => 'Course Contents retrieved successfully',
            'data' => $data
        ], 200);
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
        $user = $request->user()->id;

        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120',
        ]);

        $file = $request->file('file');

        try {
            $sheets = Excel::toArray(new CourseContentsImport, $file);
        } catch (\Throwable $e) {
            return $this->sendError('Failed to read the Excel file. Ensure the file is not corrupted.', 422);
        }

        if (empty($sheets) || empty($sheets[0])) {
            return $this->sendError('Uploaded file is empty.', 422);
        }

        $rows = $sheets[0];

        $expectedHeadings = ['semester', 'code', 'course_content', 'scu', 'lecturer', 'day', 'hour_start', 'hour_end'];
        $firstRowKeys = array_keys($rows[0]);
        $missingHeadings = array_diff($expectedHeadings, $firstRowKeys);
        if (!empty($missingHeadings)) {
            return response()->json([
                'code' => 422,
                'message' => 'Template column format is incorrect.',
                'errors' => [
                    'headings' => 'Missing columns: ' . implode(', ', $missingHeadings)
                ]
            ], 422);
        }

        $rowErrors = [];
        $duplicateRows = [];
        $validRows = [];
        $importedCount = 0;

        $rules = [
            'semester' => 'required',
            'code' => 'required',
            'course_content' => 'required',
            'scu' => 'required|integer|min:1',
            'lecturer' => 'required',
            'day' => 'required',
            'hour_start' => 'required',
            'hour_end' => 'required',
        ];

        foreach ($rows as $index => $row) {
            if (collect($row)->filter(fn($v) => trim((string)$v) !== '')->isEmpty()) {
                continue;
            }

            $lineNumber = $index + 2;

            $prepared = [];
            foreach ($expectedHeadings as $h) {
                $prepared[$h] = is_string($row[$h] ?? null) ? trim($row[$h]) : ($row[$h] ?? null);
            }

            $validator = Validator::make($prepared, $rules);

            if ($validator->fails()) {
                $rowErrors[] = [
                    'line' => $lineNumber,
                    'errors' => $validator->errors()->toArray(),
                ];
                continue;
            }

            $isDuplicateCode = CourseContent::where('code', $prepared['code'])
                ->where('user_id', $user)
                ->where('semester', $prepared['semester'])
                ->exists();
            $isDuplicateContent = CourseContent::where('course_content', $prepared['course_content'])
                ->where('user_id', $user)
                ->where('semester', $prepared['semester'])
                ->exists();

            if ($isDuplicateCode || $isDuplicateContent) {
                $duplicateRows[] = array_merge($prepared, [
                    '_line' => $lineNumber,
                    '_duplicate_message' => $isDuplicateCode
                        ? 'Code already used for that semester'
                        : 'Course content already added'
                ]);
                continue;
            }

            $validRows[] = array_merge($prepared, [
                'scu' => (int)$prepared['scu'],
                'user_id' => $user,
            ]);
        }

        if (!empty($rowErrors)) {
            return response()->json([
                'code' => 422,
                'message' => 'Validation errors occurred in the uploaded file.',
                'data' => [
                    'row_errors' => $rowErrors,
                ]
            ], 422);
        }

        DB::transaction(function () use (&$importedCount, $validRows) {
            if (!empty($validRows)) {
                CourseContent::insert($validRows);
                $importedCount = count($validRows);
            }
        });

        $status = empty($duplicateRows) ? 201 : 200;
        $message = empty($duplicateRows) ? 'Import successful.' : 'Import finished with some duplicate rows.';

        return response()->json([
            'code' => $status,
            'message' => $message,
            'data' => [
                'imported_count' => $importedCount,
                'duplicate_rows' => $duplicateRows,
            ]
        ], $status);
    }
}
