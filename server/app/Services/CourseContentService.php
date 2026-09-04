<?php

namespace App\Services;

use App\Imports\CourseContentsImport;
use App\Models\CourseContent;
use App\Models\Setting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class CourseContentService
{
    public function __construct(
        private readonly SiakangClient $siakangClient
    ) {}

    public function syncScheduleFromSiakang(int $userId, ?string $targetSemester = null, ?string $sourceSemester = null): array
    {
        $setting = Setting::where('user_id', $userId)->first();

        if (! $setting?->hasSiakangCredentials()) {
            throw new \Exception('Siakang credentials are not configured. Add them in Settings.', 422);
        }

        $response = $this->siakangClient->getSchedule(
            trim($setting->siakang_email),
            trim($setting->siakang_password),
            $sourceSemester
        );

        if (($response['code'] ?? 0) !== 200) {
            throw new \Exception($response['message'] ?? 'Failed to fetch schedule from Siakang.', (int) ($response['code'] ?: 502));
        }

        $rows = $response['data'] ?? [];

        if (empty($rows) || ! is_array($rows)) {
            throw new \Exception('No schedule data found in Siakang response.', 422);
        }

        $semesterLabel = $targetSemester;

        // Delete existing course contents for this semester before re-importing.
        if ($semesterLabel) {
            CourseContent::where('user_id', $userId)
                ->where('semester', $semesterLabel)
                ->delete();
        }

        $inserted = 0;
        $skipped = [];
        $existingCodes = CourseContent::where('user_id', $userId)
            ->when($semesterLabel, fn ($q) => $q->where('semester', $semesterLabel))
            ->pluck('code')
            ->flip();

        foreach ($rows as $course) {
            $name = trim($course['name'] ?? '');
            $code = trim($course['code'] ?? '');
            $credits = (int) ($course['credits'] ?? 0);
            $schedules = $course['schedules'] ?? [];
            $lecturers = $course['lecturers'] ?? [];
            $detail = $course['detail'] ?? null;
            $header = is_array($detail) ? ($detail['header'] ?? []) : [];

            // Prefer the detail header for class + lecturer (has degrees & class code).
            $class = trim($header['kelas'] ?? '');
            $lecturer = trim($header['dosen'] ?? '');

            // Reduce a class code like "C24" to just its leading letter ("C").
            $classLetter = $this->classLetter($class);

            if ($lecturer === '' && is_array($lecturers)) {
                $lecturer = implode(', ', $lecturers);
            }

            // Format the course name as "Nama Matkul (Kelas)", e.g. "Sistem Terdistribusi (C)".
            if ($classLetter !== '' && ! str_contains($name, "({$classLetter})")) {
                $name = $name." ({$classLetter})";
            }

            if ($name === '' || $credits <= 0) {
                $skipped[] = $name !== '' ? $name : '(unknown course)';

                continue;
            }

            $firstSchedule = is_array($schedules) ? ($schedules[0] ?? null) : null;

            $day = $this->normalizeDay($firstSchedule['day'] ?? '');
            $hourStart = $this->normalizeTime($firstSchedule['time'] ?? '');
            $hourEnd = $this->normalizeTimeEnd($firstSchedule['time'] ?? '');

            $shouldInsert = true;
            if ($code !== '' && isset($existingCodes[$code])) {
                $shouldInsert = false;
            }

            if ($shouldInsert) {
                CourseContent::create([
                    'semester' => $semesterLabel,
                    'code' => $code,
                    'course_content' => $name,
                    'credits' => $credits,
                    'lecturer' => $lecturer,
                    'day' => $day,
                    'hour_start' => $hourStart,
                    'hour_end' => $hourEnd,
                    'user_id' => $userId,
                ]);
                $inserted++;
            } else {
                $skipped[] = $name;
            }
        }

        return [
            'inserted' => $inserted,
            'skipped' => $skipped,
            'semester_label' => $semesterLabel,
        ];
    }

    private function classLetter(?string $class): string
    {
        if (! $class) {
            return '';
        }

        // "C24" -> "C", "A" -> "A"
        return strtoupper(substr(trim($class), 0, 1));
    }

    private function normalizeDay(?string $day): ?string
    {
        if (! $day) {
            return null;
        }

        $map = [
            'senin' => 'Monday',
            'selasa' => 'Tuesday',
            'rabu' => 'Wednesday',
            'kamis' => 'Thursday',
            'jumat' => 'Friday',
            'sabtu' => 'Saturday',
            'minggu' => 'Sunday',
        ];

        return $map[strtolower(trim($day))] ?? null;
    }

    /**
     * Extract the start time ("07:30 - 09:10" -> "07:30").
     */
    private function normalizeTime(?string $time): ?string
    {
        if (! $time) {
            return null;
        }

        $parts = preg_split('/\s*-\s*/', trim($time));
        $value = isset($parts[0]) ? trim($parts[0]) : null;

        return $value ? substr($value, 0, 5) : null;
    }

    /**
     * Extract the end time ("07:30 - 09:10" -> "09:10").
     */
    private function normalizeTimeEnd(?string $time): ?string
    {
        if (! $time) {
            return null;
        }

        $parts = preg_split('/\s*-\s*/', trim($time));
        $value = isset($parts[1]) ? trim($parts[1]) : null;

        return $value ? substr($value, 0, 5) : null;
    }

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
            $sheets = Excel::toArray(new CourseContentsImport, $file);
        } catch (\Throwable) {
            throw new \Exception('Failed to read the Excel file. Ensure the file is not corrupted.', 422);
        }

        if (empty($sheets) || empty($sheets[0])) {
            throw new \Exception('Uploaded file is empty.', 422);
        }

        $rows = $sheets[0];
        // Normalize alias columns: SCU/SKS -> credits (legacy template still uses SCU)
        $rows = array_map(function ($row) {
            if (! isset($row['credits']) || $row['credits'] === null || $row['credits'] === '') {
                if (isset($row['scu']) && $row['scu'] !== null && $row['scu'] !== '') {
                    $row['credits'] = $row['scu'];
                } elseif (isset($row['sks']) && $row['sks'] !== null && $row['sks'] !== '') {
                    $row['credits'] = $row['sks'];
                }
            }

            return $row;
        }, $rows);

        $expectedHeadings = ['semester', 'code', 'course_content', 'credits', 'lecturer', 'day', 'hour_start', 'hour_end'];
        $firstRowKeys = array_keys($rows[0]);
        // For missing check, treat credits as satisfied if scu/sks exists
        $keysForCheck = $firstRowKeys;
        if (in_array('scu', $firstRowKeys, true) || in_array('sks', $firstRowKeys, true)) {
            $keysForCheck[] = 'credits';
        }
        $missingHeadings = array_diff($expectedHeadings, $keysForCheck);

        if (! empty($missingHeadings)) {
            throw new \RuntimeException('Template column format is incorrect.|Missing columns: '.implode(', ', $missingHeadings));
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
            ->map(fn ($items) => $items->pluck('code')->toArray())
            ->toArray();

        $existingContents = CourseContent::where('user_id', $userId)
            ->select('course_content', 'semester')
            ->get()
            ->groupBy('semester')
            ->map(fn ($items) => $items->pluck('course_content')->toArray())
            ->toArray();

        foreach ($rows as $index => $row) {
            if (collect($row)->filter(fn ($v) => trim((string) $v) !== '')->isEmpty()) {
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

        if (! empty($rowErrors)) {
            return [
                'status' => 422,
                'message' => 'Validation errors occurred in the uploaded file.',
                'data' => [
                    'row_errors' => $rowErrors,
                ],
            ];
        }

        DB::transaction(function () use (&$importedCount, $validRows) {
            if (! empty($validRows)) {
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
