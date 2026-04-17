<?php

namespace App\Services;

use App\Imports\CourseContentsImport;
use App\Models\CourseContent;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class CourseContentService
{
    public function create(int $userId, array $data): CourseContent
    {
        $codeExists = CourseContent::where('code', $data['code'])
            ->where('user_id', $userId)
            ->where('semester', $data['semester'])
            ->exists();

        $contentExists = CourseContent::where('course_content', $data['course_content'])
            ->where('user_id', $userId)
            ->where('semester', $data['semester'])
            ->exists();

        if ($codeExists || $contentExists) {
            throw new \Exception('Course Content Already Added', 409);
        }

        return CourseContent::create([
            'semester' => $data['semester'],
            'code' => $data['code'],
            'course_content' => $data['course_content'],
            'credits' => $data['credits'],
            'lecturer' => $data['lecturer'],
            'day' => $data['day'],
            'hour_start' => $data['hour_start'],
            'hour_end' => $data['hour_end'],
            'user_id' => $userId,
        ]);
    }

    public function update(int $userId, int $id, array $data): CourseContent
    {
        $courseContent = CourseContent::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();

        $existingCode = CourseContent::where('user_id', $userId)
            ->where('id', '!=', $id)
            ->where('code', $data['code'])
            ->where('semester', $data['semester'])
            ->exists();

        if ($existingCode) {
            throw new \Exception('Code already exists for this user', 409);
        }

        $existingContent = CourseContent::where('user_id', $userId)
            ->where('id', '!=', $id)
            ->where('course_content', $data['course_content'])
            ->where('semester', $data['semester'])
            ->exists();

        if ($existingContent) {
            throw new \Exception('Course Content already exists for this user', 409);
        }

        $courseContent->update([
            'semester' => $data['semester'],
            'code' => $data['code'],
            'course_content' => $data['course_content'],
            'credits' => $data['credits'],
            'lecturer' => $data['lecturer'],
            'day' => $data['day'],
            'hour_start' => $data['hour_start'],
            'hour_end' => $data['hour_end'],
        ]);

        return $courseContent;
    }

    public function delete(int $userId, int $id): void
    {
        $courseContent = CourseContent::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();

        $courseContent->delete();
    }

    public function filter(int $userId, string $semester): array
    {
        $courseContents = CourseContent::where('user_id', $userId)
            ->where('semester', $semester)
            ->orderByRaw(
                "CASE LOWER(day)
                    WHEN 'monday' THEN 1
                    WHEN 'senin' THEN 1
                    WHEN 'tuesday' THEN 2
                    WHEN 'selasa' THEN 2
                    WHEN 'wednesday' THEN 3
                    WHEN 'rabu' THEN 3
                    WHEN 'thursday' THEN 4
                    WHEN 'kamis' THEN 4
                    WHEN 'friday' THEN 5
                    WHEN 'jumat' THEN 5
                    WHEN 'saturday' THEN 6
                    WHEN 'sabtu' THEN 6
                    WHEN 'sunday' THEN 7
                    WHEN 'minggu' THEN 7
                    ELSE 99
                END ASC"
            )
            ->orderBy('hour_start', 'ASC')
            ->orderBy('course_content', 'ASC')
            ->get()
            ->map(function ($courseContent) {
                return [
                    'id' => $courseContent->id,
                    'semester' => $courseContent->semester,
                    'code' => $courseContent->code,
                    'course_content' => $courseContent->course_content,
                    'credits' => $courseContent->credits,
                    'lecturer' => $courseContent->lecturer,
                    'day' => $courseContent->day,
                    'hour_start' => date('H:i', strtotime((string) $courseContent->hour_start)),
                    'hour_end' => date('H:i', strtotime((string) $courseContent->hour_end)),
                ];
            });

        return [
            'total_credits' => $courseContents->sum('credits'),
            'course_contents' => $courseContents,
        ];
    }

    public function importFromExcel(int $userId, UploadedFile $file): array
    {
        try {
            $sheets = Excel::toArray(new CourseContentsImport(), $file);
        } catch (\Throwable) {
            throw new \Exception('Failed to read the Excel file. Ensure the file is not corrupted.', 422);
        }

        if (empty($sheets) || empty($sheets[0])) {
            throw new \Exception('Uploaded file is empty.', 422);
        }

        $rows = $sheets[0];
        $expectedHeadings = ['semester', 'code', 'course_content', 'credits', 'lecturer', 'day', 'hour_start', 'hour_end'];
        $firstRowKeys = array_keys($rows[0]);
        $missingHeadings = array_diff($expectedHeadings, $firstRowKeys);

        if (!empty($missingHeadings)) {
            throw new \RuntimeException('Template column format is incorrect.|Missing columns: ' . implode(', ', $missingHeadings));
        }

        $rowErrors = [];
        $duplicateRows = [];
        $validRows = [];
        $importedCount = 0;

        $rules = [
            'semester' => 'required',
            'code' => 'required',
            'course_content' => 'required',
            'credits' => 'required|integer|min:1',
            'lecturer' => 'required',
            'day' => 'required',
            'hour_start' => 'required',
            'hour_end' => 'required',
        ];

        $existingCodes = CourseContent::where('user_id', $userId)
            ->select('code', 'semester')
            ->get()
            ->groupBy('semester')
            ->map(fn($items) => $items->pluck('code')->toArray())
            ->toArray();

        $existingContents = CourseContent::where('user_id', $userId)
            ->select('course_content', 'semester')
            ->get()
            ->groupBy('semester')
            ->map(fn($items) => $items->pluck('course_content')->toArray())
            ->toArray();

        foreach ($rows as $index => $row) {
            if (collect($row)->filter(fn($v) => trim((string) $v) !== '')->isEmpty()) {
                continue;
            }

            $lineNumber = $index + 2;
            $prepared = [];

            foreach ($expectedHeadings as $heading) {
                $prepared[$heading] = is_string($row[$heading] ?? null)
                    ? trim($row[$heading])
                    : ($row[$heading] ?? null);
            }

            $validator = Validator::make($prepared, $rules);
            if ($validator->fails()) {
                $rowErrors[] = [
                    'line' => $lineNumber,
                    'errors' => $validator->errors()->toArray(),
                ];
                continue;
            }

            $isDuplicateCode = in_array($prepared['code'], $existingCodes[$prepared['semester']] ?? [], true);
            $isDuplicateContent = in_array($prepared['course_content'], $existingContents[$prepared['semester']] ?? [], true);

            if ($isDuplicateCode || $isDuplicateContent) {
                $duplicateRows[] = array_merge($prepared, [
                    '_line' => $lineNumber,
                    '_duplicate_message' => $isDuplicateCode
                        ? 'Code already used for that semester'
                        : 'Course content already added',
                ]);
                continue;
            }

            $validRows[] = array_merge($prepared, [
                'credits' => (int) $prepared['credits'],
                'user_id' => $userId,
            ]);
        }

        if (!empty($rowErrors)) {
            return [
                'status' => 422,
                'message' => 'Validation errors occurred in the uploaded file.',
                'data' => [
                    'row_errors' => $rowErrors,
                ],
            ];
        }

        DB::transaction(function () use (&$importedCount, $validRows) {
            if (!empty($validRows)) {
                CourseContent::insert($validRows);
                $importedCount = count($validRows);
            }
        });

        $status = empty($duplicateRows) ? 201 : 200;
        $message = empty($duplicateRows) ? 'Import successful.' : 'Import finished with some duplicate rows.';

        return [
            'status' => $status,
            'message' => $message,
            'data' => [
                'imported_count' => $importedCount,
                'duplicate_rows' => $duplicateRows,
            ],
        ];
    }
}
