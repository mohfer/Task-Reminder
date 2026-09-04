<?php

use App\Models\CourseContent;
use App\Models\Grade;
use App\Models\Setting;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

// ─── Setting model helpers ───
test('setting wantsEmailChannel and wantsTelegramChannel', function () {
    $user = User::factory()->create();

    $email = Setting::create(['deadline_notification'=>'5 days left','task_created_notification'=>1,'task_completed_notification'=>1,'notification_channel'=>Setting::CHANNEL_EMAIL,'telegram_chat_id'=>null,'user_id'=>$user->id]);
    expect($email->wantsEmailChannel())->toBeTrue();
    expect($email->wantsTelegramChannel())->toBeFalse();

    $tele = Setting::create(['deadline_notification'=>'5 days left','task_created_notification'=>1,'task_completed_notification'=>1,'notification_channel'=>Setting::CHANNEL_TELEGRAM,'telegram_chat_id'=>'123','user_id'=>User::factory()->create()->id]);
    expect($tele->wantsEmailChannel())->toBeFalse();
    expect($tele->wantsTelegramChannel())->toBeTrue();

    $both = Setting::create(['deadline_notification'=>'5 days left','task_created_notification'=>1,'task_completed_notification'=>1,'notification_channel'=>Setting::CHANNEL_BOTH,'telegram_chat_id'=>'123','user_id'=>User::factory()->create()->id]);
    expect($both->wantsEmailChannel())->toBeTrue();
    expect($both->wantsTelegramChannel())->toBeTrue();
});

test('setting hasTelegramChatId and hasSiakangCredentials', function () {
    $user = User::factory()->create();
    $s = Setting::create(['deadline_notification'=>'5 days left','task_created_notification'=>1,'task_completed_notification'=>1,'notification_channel'=>Setting::CHANNEL_EMAIL,'telegram_chat_id'=>null,'user_id'=>$user->id]);
    expect($s->hasTelegramChatId())->toBeFalse();
    expect($s->hasSiakangCredentials())->toBeFalse();

    $s->update(['telegram_chat_id'=>'  123  ']);
    expect($s->fresh()->hasTelegramChatId())->toBeTrue();

    $s->update(['telegram_chat_id'=>'   ']);
    expect($s->fresh()->hasTelegramChatId())->toBeFalse();

    // siakang encrypted cast
    $s2 = Setting::create(['deadline_notification'=>'5 days left','task_created_notification'=>1,'task_completed_notification'=>1,'notification_channel'=>Setting::CHANNEL_EMAIL,'telegram_chat_id'=>null,'siakang_email'=>'a@b.com','siakang_password'=>'secret','user_id'=>User::factory()->create()->id]);
    expect($s2->hasSiakangCredentials())->toBeTrue();
    expect($s2->siakang_email)->toBe('a@b.com');
    expect($s2->siakang_password)->toBe('secret');
    // hidden
    expect($s2->toArray())->not->toHaveKey('siakang_email');
    expect($s2->toArray())->not->toHaveKey('siakang_password');
});

test('setting hasSiakangCredentials trims whitespace', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $s = Setting::factory()->create(['user_id'=>$user1->id, 'siakang_email'=>'  ', 'siakang_password'=>'  ']);
    expect($s->hasSiakangCredentials())->toBeFalse();
    $s2 = Setting::factory()->create(['user_id'=>$user2->id, 'siakang_email'=>' a@b.com ', 'siakang_password'=>' secret ']);
    // trim in model uses trim, so spaces still count as present
    expect($s2->hasSiakangCredentials())->toBeTrue();
});

// ─── Task deadline_label ───
test('task deadline_label reflects status and dates', function () {
    $user = User::factory()->create();
    $course = CourseContent::create(['semester'=>'S1','code'=>'MK001','course_content'=>'Kalkulus','credits'=>3,'lecturer'=>'A','day'=>'Senin','hour_start'=>'08:00','hour_end'=>'10:00','user_id'=>$user->id]);

    // Completed
    $t = Task::create(['task'=>'T','deadline'=>now()->addDays(5)->toDateString(),'status'=>1,'priority'=>0,'course_content_id'=>$course->id,'user_id'=>$user->id]);
    expect($t->deadline_label)->toBe('Completed');

    // Overdue
    $t2 = Task::create(['task'=>'T2','deadline'=>Carbon::now()->subDays(2)->toDateString(),'status'=>0,'priority'=>0,'course_content_id'=>$course->id,'user_id'=>$user->id]);
    expect($t2->fresh()->deadline_label)->toBe('Overdue');

    // Due today
    $t3 = Task::create(['task'=>'T3','deadline'=>Carbon::now()->toDateString(),'status'=>0,'priority'=>0,'course_content_id'=>$course->id,'user_id'=>$user->id]);
    expect($t3->fresh()->deadline_label)->toBe('Due today');

    // 1 day left
    $t4 = Task::create(['task'=>'T4','deadline'=>Carbon::now()->addDay()->toDateString(),'status'=>0,'priority'=>0,'course_content_id'=>$course->id,'user_id'=>$user->id]);
    expect($t4->fresh()->deadline_label)->toBe('1 day left');

    // 5 days left
    $t5 = Task::create(['task'=>'T5','deadline'=>Carbon::now()->addDays(5)->toDateString(),'status'=>0,'priority'=>0,'course_content_id'=>$course->id,'user_id'=>$user->id]);
    expect($t5->fresh()->deadline_label)->toBe('5 days left');
});

test('task relations and fillable', function () {
    $user = User::factory()->create();
    $course = CourseContent::create(['semester'=>'S1','code'=>'MK001','course_content'=>'Kalkulus','credits'=>3,'lecturer'=>'A','day'=>'Senin','hour_start'=>'08:00','hour_end'=>'10:00','user_id'=>$user->id]);
    $task = Task::create(['task'=>'T','deadline'=>now()->toDateString(),'status'=>0,'priority'=>1,'course_content_id'=>$course->id,'user_id'=>$user->id]);
    expect($task->user->id)->toBe($user->id);
    expect($task->course_content->id)->toBe($course->id);
    expect($task->priority)->toBe(1);
    expect($task->toArray())->toHaveKey('deadline_label');
});

// ─── CourseContent relations ───
test('courseContent has tasks and belongs to user', function () {
    $user = User::factory()->create();
    $course = CourseContent::create(['semester'=>'S1','code'=>'MK001','course_content'=>'Kalkulus','credits'=>3,'lecturer'=>'A','day'=>'Senin','hour_start'=>'08:00','hour_end'=>'10:00','user_id'=>$user->id]);
    $task = Task::create(['task'=>'T','deadline'=>now()->toDateString(),'status'=>0,'course_content_id'=>$course->id,'user_id'=>$user->id]);
    expect($course->user->id)->toBe($user->id);
    expect($course->tasks)->toHaveCount(1);
    expect($course->tasks->first()->id)->toBe($task->id);
});

// ─── Grade ordering is via service, but model fillable ───
test('grade fillable and belongs to user', function () {
    $user = User::factory()->create();
    $grade = Grade::create(['grade'=>'A','grade_point'=>4.00,'minimal_score'=>85,'maximal_score'=>100,'user_id'=>$user->id]);
    expect($grade->user->id)->toBe($user->id);
    expect($grade->grade)->toBe('A');
});

// ─── User relations ───
test('user has course_contents tasks grades setting', function () {
    $user = User::factory()->create();
    $course = CourseContent::create(['semester'=>'S1','code'=>'MK001','course_content'=>'Kalkulus','credits'=>3,'lecturer'=>'A','day'=>'Senin','hour_start'=>'08:00','hour_end'=>'10:00','user_id'=>$user->id]);
    $task = Task::create(['task'=>'T','deadline'=>now()->toDateString(),'status'=>0,'course_content_id'=>$course->id,'user_id'=>$user->id]);
    $grade = Grade::create(['grade'=>'A','grade_point'=>4,'minimal_score'=>85,'maximal_score'=>100,'user_id'=>$user->id]);
    $setting = Setting::create(['deadline_notification'=>'5 days left','task_created_notification'=>1,'task_completed_notification'=>1,'notification_channel'=>'email','user_id'=>$user->id]);
    expect($user->course_contents)->toHaveCount(1);
    expect($user->tasks)->toHaveCount(1);
    expect($user->grades)->toHaveCount(1);
    expect($user->setting->id)->toBe($setting->id);
});

// ─── User casts ───
test('user password is hashed and email_verified_at is datetime', function () {
    $user = User::factory()->create(['password'=>'password']);
    expect($user->password)->not->toBe('password');
    expect($user->email_verified_at)->toBeInstanceOf(Carbon::class);
});
