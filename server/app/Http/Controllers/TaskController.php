<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Task;
use App\Models\Setting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Models\CourseContent;
use App\Services\WhatsAppService;
use App\Notifications\TaskCompletedNotification;
use App\Notifications\TaskCreatedNotification;

class TaskController
{
    use ApiResponse;

    protected $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $courseContent = CourseContent::where('id', $request->course_content_id)->where('user_id', $user->id)->first();
        $settings = Setting::where('user_id', $user->id)->first();
        $phone = $request->user()->phone;
        $name = $request->user()->name;
        $deadline = Carbon::parse($request->deadline)->format('j F Y');

        $request->validate([
            'task' => 'required',
            'deadline' => 'required|date',
            'priority' => 'boolean',
            'course_content_id' => 'required'
        ]);

        $request['priority'] == true ? 1 : 0;
        $request['status'] = 0;
        $request['user_id'] = $user->id;

        if (!$courseContent) {
            return $this->sendError('Course Content not found', 404);
        }

        $courseContentName = $courseContent->course_content;

        if ($settings->task_created_notification === 1) {
            $user->notify(new TaskCreatedNotification($courseContent->course_content, $request['task'], $request['description'], $deadline));

            //             $to = '+62' . $phone;
            //             $message = "
            //         Hai, {$name}! 👋

            // Kamu sudah berhasil membuat tugas baru nih, berikut detailnya:

            // - Mata Kuliah: *{$courseContentName}*
            // - Tugas: *{$request->task}*
            // - Deadline: *{$deadline}*

            // Semoga lancar ya! 😊
            //         ";

            //             try {
            //                 $this->whatsappService->sendMessage($to, $message);
            //                 $task = Task::create($request->all());
            //                 return $this->sendResponse($task, 'Task created successfully');
            //             } catch (\Exception $e) {
            //                 return $this->sendError(null, 'Failed to send WhatsApp message', 500);
            //             }
        }

        $task = Task::create($request->all());

        return $this->sendResponse($task, 'Task created successfully', 201);
    }

    public function show($id)
    {
        $task = Task::with('course_content')->find($id);

        if (!$task) {
            return $this->sendError('Task not found', 404);
        }

        $data = [
            'id' => $task->id,
            'semester' => $task->course_content->semester ?? null,
            'course_content' => $task->course_content->course_content ?? null,
            'task' => $task->task,
            'deadline' => $task->deadline,
        ];

        return $this->sendResponse($data, 'Task retrieved successfully');
    }

    public function update(Request $request, $id)
    {
        $user = $request->user()->id;

        $task = Task::find($id);

        if (!$task) {
            return $this->sendError('Task not found', 404);
        }

        $request->validate([
            'task' => 'required',
            'deadline' => 'required|date',
            'course_content_id' => 'required'
        ]);

        $request['user_id'] = $user;

        $task->update($request->all());

        return $this->sendResponse($task, 'Task updated successfully');
    }

    public function destroy($id)
    {
        $task = Task::find($id);

        if (!$task) {
            return $this->sendError('Task not found', 404);
        }

        $task->delete();

        return $this->sendResponse(null, 'Task deleted successfully');
    }

    public function statusChanged(Request $request, $id)
    {
        $task = Task::with('course_content')->where('id', $id)->where('user_id', $request->user()->id)->first();
        $settings = Setting::where('user_id', $request->user()->id)->first();
        $user = $request->user();
        $name = $request->user()->name;
        $phone = $request->user()->phone;

        if (!$task) {
            return $this->sendError('Task not found', 404);
        }

        $request['status'] = $task->status == 1 ? 0 : 1;

        if ($task->status == 0 && $request['status'] == 1 && $settings->task_completed_notification === 1) {
            $user->notify(new TaskCompletedNotification($task));

            //             $to = +62 . $phone;
            //             $message = "
            //         Hai, {$name}! 👋

            // Makasih banyak sudah ambis menyelesaikan tugas berikut:

            // - Mata Kuliah: *{$task->course_content->course_content}*
            // - Tugas: *{$task->task}*

            // Semangat terus ya! 😊
            //         ";

            //             try {
            //                 $this->whatsappService->sendMessage($to, $message);
            //                 $task->update($request->all());
            //                 return $this->sendResponse($task, 'Task status changed successfully');
            //             } catch (\Exception $e) {
            //                 return $this->sendError(null, 'Failed to send WhatsApp message');
            //             }
            //         }
        }

        $task->update($request->all());
        return $this->sendResponse($task, 'Task status changed successfully');
    }
}
