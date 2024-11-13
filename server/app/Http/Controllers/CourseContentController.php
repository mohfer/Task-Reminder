<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Models\CourseContent;

class CourseContentController
{
    use ApiResponse;

    public function index()
    {
        $courseContents = CourseContent::orderBy('course_content', 'ASC')->get();
        return $this->sendResponse($courseContents, 'Course Contents retrieved successfully');
    }

    public function store(Request $request)
    {
        $code = CourseContent::where('code', $request->code)->where('user_id', $request->user_id)->exists();
        $courseContent = CourseContent::where('course_content', $request->course_content)->where('user_id', $request->user_id)->exists();

        if ($code || $courseContent) {
            return $this->sendResponse(null, 'Course Content Already Added', 400);
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
            'user_id' => 'required',
        ]);

        $courseContent = CourseContent::create($request->all());
        return $this->sendResponse($courseContent, 'Course Content created successfully', 201);
    }

    public function show($id)
    {
        $courseContent = CourseContent::find($id);

        if (!$courseContent) {
            return $this->sendResponse(null, 'Course Content not found', 404);
        }

        return $this->sendResponse($courseContent, 'Course Content retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $courseContent = CourseContent::where('id', $id)
            ->where('user_id', $request->user_id)
            ->first();

        if (!$courseContent) {
            return $this->sendResponse(null, 'Course Content not found', 404);
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
            'user_id' => 'required',
        ]);

        $existingCode = CourseContent::where('user_id', $request->user_id)
            ->where('id', '!=', $id)
            ->where('code', $request->code)
            ->exists();

        if ($existingCode) {
            return $this->sendResponse(null, 'Code already exists for this user', 400);
        }

        $existingContent = CourseContent::where('user_id', $request->user_id)
            ->where('id', '!=', $id)
            ->where('course_content', $request->course_content)
            ->exists();

        if ($existingContent) {
            return $this->sendResponse(null, 'Course Content already exists for this user', 400);
        }

        $courseContent->save();

        return $this->sendResponse($courseContent, 'Course Content updated successfully');
    }

    public function destroy($id)
    {
        $courseContent = CourseContent::find($id);

        if (!$courseContent) {
            return $this->sendResponse(null, 'Course Content not found', 404);
        }

        $courseContent->delete();

        return $this->sendResponse(null, 'Course Content deleted successfully');
    }
}
