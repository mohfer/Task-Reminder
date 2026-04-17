<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\Task;
use App\Models\Setting;
use App\Services\TelegramService;
use App\Notifications\ReminderEmailNotifications;
use Illuminate\Console\Command;

class SendReminderEmailNotifications extends Command
{
    public function __construct(
        private readonly TelegramService $telegramService
    ) {
        parent::__construct();
    }

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:reminder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send reminder email notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $settings = Setting::all();
        $today = Carbon::now()->format('Y-m-d');

        foreach ($settings as $setting) {
            $notifications = [];
            $days = intval($setting->deadline_notification);
            $notificationDate = Carbon::now()->addDays($days)->format('Y-m-d');

            $tasks = Task::where('user_id', $setting->user_id)
                ->where(function ($query) use ($notificationDate, $today) {
                    $query->where('deadline', $notificationDate)
                        ->orWhere('deadline', $today)
                        ->orWhere('deadline', Carbon::now()->addDay(1)->format('Y-m-d'))
                        ->orWhere('priority', 1);
                })
                ->where('status', 0)
                ->get();

            if ($tasks->isNotEmpty()) {
                $user = $setting->user;

                foreach ($tasks as $task) {
                    $deadline = Carbon::parse($task->deadline)->format('d F Y');
                    $notifications[] = [
                        'course_content' => $task->course_content->course_content,
                        'task' => $task->task,
                        'description' => $task->description,
                        'deadline' => $deadline
                    ];
                }

                if ($setting->wantsEmailChannel()) {
                    $user->notify(new ReminderEmailNotifications($notifications));
                }

                if ($setting->wantsTelegramChannel() && $setting->hasTelegramChatId()) {
                    $this->telegramService->sendReminderSummary((string) $setting->telegram_chat_id, $notifications);
                }
            }
        }

        $this->info('Notifications sent directly!');
    }
}
