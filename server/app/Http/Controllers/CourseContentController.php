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

        $courseContents = CourseContent::where('user_id', $user)->where('semester', 'Semester 1')->orderBy('course_content', 'ASC')->get();

        if (!$courseContents) {
            return $this->sendError('Course Content not found', 404);
        }

        return $this->sendResponse($courseContents, 'Course Contents retrieved successfully');
    }

    public function store(Request $request)
    {
        $user = $request->user()->id;
        $code = CourseContent::where('code', $request->code)->where('user_id', $user)->exists();
        $courseContent = CourseContent::where('course_content', $request->course_content)->where('user_id', $user)->exists();

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

    public function show($id)
    {
        $courseContent = CourseContent::find($id);

        if (!$courseContent) {
            return $this->sendError('Course Content not found', 404);
        }

        return $this->sendResponse($courseContent, 'Course Content retrieved successfully');
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
            ->exists();

        if ($existingCode) {
            return $this->sendError('Code already exists for this user', 409);
        }

        $existingContent = CourseContent::where('user_id', $user)
            ->where('id', '!=', $id)
            ->where('course_content', $request->course_content)
            ->exists();

        if ($existingContent) {
            return $this->sendError('Course Content already exists for this user', 409);
        }

        $request['user_id'] = $user;

        $courseContent->update($request->all());

        return $this->sendResponse($courseContent, 'Course Content updated successfully');
    }

    public function destroy($id)
    {
        $courseContent = CourseContent::find($id);

        if (!$courseContent) {
            return $this->sendError('Course Content not found', 404);
        }

        $courseContent->delete();

        return $this->sendResponse(null, 'Course Content deleted successfully');
    }

    public function filter(Request $request)
    {
        $user = $request->user()->id;

        $courseContents = CourseContent::where('user_id', $user)->where('semester', $request->semester)->orderBy('course_content', 'ASC')->get();

        if (!$courseContents) {
            return $this->sendError('Course Content not found', 404);
        }

        return $this->sendResponse($courseContents, 'Course Contents retrieved successfully');
    }
}
