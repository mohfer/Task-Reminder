<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\CourseContentRequest;
use App\Models\CourseContent;
use App\Http\Resources\CourseContentResource;

class CourseContentController
{
    public function index()
    {
        $courseContents = CourseContent::orderBy('course_content')->paginate(10);

        return new CourseContentResource(true, 'List Data Course Content', $courseContents);
    }

    public function store(CourseContentRequest $request)
    {
        $courseContent = CourseContent::create($request->validated());

        return new CourseContentResource(true, 'Data Course Content Berhasil Ditambah!', $courseContent);
    }

    public function show(CourseContent $courseContent)
    {
        return new CourseContentResource(true, 'Data Course Content Ditemukan!', $courseContent);
    }

    public function update(CourseContentRequest $request, CourseContent $courseContent)
    {
        $courseContent->update($request->validated());

        return new CourseContentResource(true, 'Data Course Content Berhasil Diubah!', $courseContent);
    }

    public function destroy(CourseContent $courseContent)
    {
        $courseContent->delete();

        return new CourseContentResource(true, 'Data Course Content Berhasil Dihapus!', null);
    }
}
