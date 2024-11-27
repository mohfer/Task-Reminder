<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\Task;
use App\Models\Setting;
use Illuminate\Console\Command;
use App\Services\WhatsAppService;

class SendWhatsappNotifications extends Command
{
    protected $whatsappService;

    protected $signature = 'notifications:direct';
    protected $description = 'Send task notifications without scheduler';

    public function __construct(WhatsAppService $whatsappService)
    {
        parent::__construct();
        $this->whatsappService = $whatsappService;
    }

    public function handle()
    {
        $settings = Setting::all();
        $today = Carbon::now()->format('Y-m-d');
        $notifications = [];

        foreach ($settings as $setting) {
            $days = intval($setting->deadline_notification);
            $notificationDate = Carbon::now()->addDays($days)->format('Y-m-d');

            $tasks = Task::where('user_id', $setting->user_id)
                ->where(function ($query) use ($notificationDate, $today) {
                    $query->where('deadline', $notificationDate)
                        ->orWhere('deadline', $today);
                })
                ->where('status', 0)
                ->get();

            if ($tasks->isNotEmpty()) {
                $user = $setting->user;
                $phone = $user->phone;

                foreach ($tasks as $task) {
                    $deadline = Carbon::parse($task->deadline)->format('d F Y');
                    $message = "
                        Hai, {$user->name}! 👋

Ada tugas yang perlu kamu kerjakan nih:

- Mata Kuliah: *{$task->course_content->course_content}*
- Tugas: *{$task->task}*
- Deadline: *{$deadline}*

Yuk, jangan sampai terlambat! 😊
                        ";

                    try {
                        $this->whatsappService->sendMessage('+62' . $phone, $message);

                        $notifications[] = [
                            'user_id' => $user->id,
                            'phone' => $phone,
                            'task' => $task->task,
                            'message' => $message,
                            'status' => 'success'
                        ];
                    } catch (\Exception $e) {
                        $notifications[] = [
                            'user_id' => $user->id,
                            'phone' => $phone,
                            'task' => $task->task,
                            'error' => $e->getMessage(),
                            'status' => 'failed'
                        ];
                    }
                }
            }
        }

        $this->info('Notifications sent directly!');
    }
}
