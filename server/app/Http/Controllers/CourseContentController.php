<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Models\CourseContent;

class CourseContentController
{
    use ApiResponse;

    public function index(Request $request)
    {
        $user = $request->user()->id;

        $courseContents = CourseContent::where('user_id', $user)
            ->where('semester', 'Semester 1')
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
}
