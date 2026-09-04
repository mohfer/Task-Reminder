<?php

use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\ImportCourseContentRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\SendResetLinkRequest;
use App\Http\Requests\StoreCourseContentRequest;
use App\Http\Requests\StoreGradeRequest;
use App\Http\Requests\StoreSiakangCredentialsRequest;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\SyncAssessmentRequest;
use App\Http\Requests\SyncScheduleRequest;
use App\Http\Requests\UpdateAssessmentRequest;
use App\Http\Requests\UpdateCourseContentRequest;
use App\Http\Requests\UpdateDeadlineNotificationRequest;
use App\Http\Requests\UpdateGradeRequest;
use App\Http\Requests\UpdateNotificationChannelRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Requests\UpdateTelegramChatIdRequest;
use App\Models\Grade;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;

uses(Tests\TestCase::class, RefreshDatabase::class);

function rulesFor(string $requestClass): array
{
    $request = new $requestClass();
    return $request->rules();
}

function authorizeFor(string $requestClass): bool
{
    $request = new $requestClass();
    // FormRequest authorize expects user, but our implementation returns true unconditionally
    return $request->authorize();
}

// ─── authorize always true ───
test('all requests authorize returns true', function () {
    $classes = [
        LoginRequest::class, RegisterRequest::class, StoreTaskRequest::class, UpdateTaskRequest::class,
        StoreCourseContentRequest::class, UpdateCourseContentRequest::class, SyncScheduleRequest::class,
        ImportCourseContentRequest::class, UpdateAssessmentRequest::class, SyncAssessmentRequest::class,
        UpdateDeadlineNotificationRequest::class, UpdateNotificationChannelRequest::class, UpdateTelegramChatIdRequest::class,
        StoreSiakangCredentialsRequest::class, StoreGradeRequest::class, UpdateGradeRequest::class,
        UpdateProfileRequest::class, ChangePasswordRequest::class, SendResetLinkRequest::class, ResetPasswordRequest::class,
    ];
    foreach ($classes as $class) {
        expect(authorizeFor($class))->toBeTrue();
    }
});

// ─── LoginRequest ───
test('LoginRequest validates', function () {
    $rules = rulesFor(LoginRequest::class);
    expect($rules)->toHaveKeys(['email', 'password', 'remember_me']);

    $fail = Validator::make(['email' => 'not-email', 'password' => ''], $rules);
    expect($fail->fails())->toBeTrue();
    expect($fail->errors()->has('email'))->toBeTrue();
    expect($fail->errors()->has('password'))->toBeTrue();

    $ok = Validator::make(['email' => 'a@b.com', 'password' => 'secret'], $rules);
    expect($ok->passes())->toBeTrue();

    $ok2 = Validator::make(['email' => 'a@b.com', 'password' => 'secret', 'remember_me' => 'notbool'], $rules);
    expect($ok2->fails())->toBeTrue();
    expect($ok2->errors()->has('remember_me'))->toBeTrue();

    $ok3 = Validator::make(['email' => 'a@b.com', 'password' => 'secret', 'remember_me' => true], $rules);
    expect($ok3->passes())->toBeTrue();
});

// ─── RegisterRequest ───
test('RegisterRequest validates', function () {
    $rules = rulesFor(RegisterRequest::class);
    expect($rules)->toHaveKeys(['name', 'email', 'password', 'password_confirmation']);

    $fail = Validator::make(['name' => '', 'email' => 'bad', 'password' => 'short', 'password_confirmation' => 'diff'], $rules);
    expect($fail->fails())->toBeTrue();

    $ok = Validator::make(['name' => 'Test', 'email' => 'new@example.com', 'password' => 'password123', 'password_confirmation' => 'password123'], $rules);
    expect($ok->passes())->toBeTrue();

    // unique
    User::factory()->create(['email' => 'taken@example.com']);
    $dup = Validator::make(['name' => 'Test', 'email' => 'taken@example.com', 'password' => 'password123', 'password_confirmation' => 'password123'], $rules);
    expect($dup->fails())->toBeTrue();
    expect($dup->errors()->has('email'))->toBeTrue();
});

// ─── StoreTaskRequest ───
test('StoreTaskRequest validates', function () {
    $rules = rulesFor(StoreTaskRequest::class);
    expect($rules)->toHaveKeys(['task', 'description', 'deadline', 'priority', 'course_content_id']);

    $course = \App\Models\CourseContent::create([
        'semester' => 'S1', 'code' => 'MK001', 'course_content' => 'Kalkulus', 'credits' => 3, 'lecturer' => 'A', 'day' => 'Senin', 'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => User::factory()->create()->id,
    ]);
    $fail = Validator::make(['task' => '', 'deadline' => 'not-date', 'course_content_id' => 99999], $rules);
    expect($fail->fails())->toBeTrue();
    expect($fail->errors()->has('task'))->toBeTrue();
    expect($fail->errors()->has('deadline'))->toBeTrue();
    expect($fail->errors()->has('course_content_id'))->toBeTrue();

    $ok = Validator::make(['task' => 'Kerjakan PR', 'deadline' => '2025-06-15', 'course_content_id' => $course->id], $rules);
    expect($ok->passes())->toBeTrue();

    $ok2 = Validator::make(['task' => 'Kerjakan PR', 'description' => 'Bab 1', 'deadline' => '2025-06-15', 'priority' => true, 'course_content_id' => $course->id], $rules);
    expect($ok2->passes())->toBeTrue();

    $badPriority = Validator::make(['task' => 'X', 'deadline' => '2025-06-15', 'priority' => 'notbool', 'course_content_id' => $course->id], $rules);
    expect($badPriority->fails())->toBeTrue();
});

// ─── UpdateTaskRequest ───
test('UpdateTaskRequest validates', function () {
    $rules = rulesFor(UpdateTaskRequest::class);
    expect($rules)->toHaveKeys(['task', 'deadline', 'course_content_id']);

    $course = \App\Models\CourseContent::create([
        'semester' => 'S1', 'code' => 'MK002', 'course_content' => 'Fisika', 'credits' => 3, 'lecturer' => 'B', 'day' => 'Selasa', 'hour_start' => '08:00', 'hour_end' => '10:00', 'user_id' => User::factory()->create()->id,
    ]);
    $fail = Validator::make(['task' => '', 'deadline' => '', 'course_content_id' => ''], $rules);
    expect($fail->fails())->toBeTrue();

    $ok = Validator::make(['task' => 'Updated', 'deadline' => '2025-12-31', 'course_content_id' => $course->id], $rules);
    expect($ok->passes())->toBeTrue();
});

// ─── StoreCourseContentRequest ───
test('StoreCourseContentRequest validates', function () {
    $rules = rulesFor(StoreCourseContentRequest::class);
    foreach (['semester','code','course_content','credits','lecturer','day','hour_start','hour_end'] as $field) {
        expect($rules)->toHaveKey($field);
    }
    $fail = Validator::make([], $rules);
    expect($fail->fails())->toBeTrue();
    expect($fail->errors()->keys())->toHaveCount(8);

    $badCredits = Validator::make(['semester' => 'S1','code'=>'MK001','course_content'=>'Kalkulus','credits'=>0,'lecturer'=>'A','day'=>'Senin','hour_start'=>'08:00','hour_end'=>'10:00'], $rules);
    expect($badCredits->fails())->toBeTrue();
    expect($badCredits->errors()->has('credits'))->toBeTrue();

    $ok = Validator::make(['semester' => 'S1','code'=>'MK001','course_content'=>'Kalkulus','credits'=>3,'lecturer'=>'A','day'=>'Senin','hour_start'=>'08:00','hour_end'=>'10:00'], $rules);
    expect($ok->passes())->toBeTrue();
});

test('UpdateCourseContentRequest validates same as store', function () {
    $rules = rulesFor(UpdateCourseContentRequest::class);
    $fail = Validator::make([], $rules);
    expect($fail->fails())->toBeTrue();
    $ok = Validator::make(['semester' => 'S1','code'=>'MK001','course_content'=>'Kalkulus','credits'=>3,'lecturer'=>'A','day'=>'Senin','hour_start'=>'08:00','hour_end'=>'10:00'], $rules);
    expect($ok->passes())->toBeTrue();
});

// ─── SyncScheduleRequest ───
test('SyncScheduleRequest validates nullable strings', function () {
    $rules = rulesFor(SyncScheduleRequest::class);
    expect($rules)->toHaveKeys(['semester','source_semester']);
    $okEmpty = Validator::make([], $rules);
    expect($okEmpty->passes())->toBeTrue();
    $okNull = Validator::make(['semester'=>null,'source_semester'=>null], $rules);
    expect($okNull->passes())->toBeTrue();
    $okStr = Validator::make(['semester'=>'Semester 1','source_semester'=>'20251'], $rules);
    expect($okStr->passes())->toBeTrue();
    $fail = Validator::make(['semester'=>123], $rules);
    expect($fail->fails())->toBeTrue();
});

// ─── ImportCourseContentRequest ───
test('ImportCourseContentRequest validates', function () {
    $rules = rulesFor(ImportCourseContentRequest::class);
    expect($rules)->toHaveKey('file');
    $fail = Validator::make([], $rules);
    expect($fail->fails())->toBeTrue();
    // mimes and max are tested via file upload in feature tests; here we just check rule presence
    expect($rules['file'])->toContain('mimes:xlsx,xls,csv');
});

// ─── UpdateAssessmentRequest ───
test('UpdateAssessmentRequest validates score 0-100', function () {
    $rules = rulesFor(UpdateAssessmentRequest::class);
    expect($rules)->toHaveKey('score');
    $okNull = Validator::make(['score'=>null], $rules);
    expect($okNull->passes())->toBeTrue();
    $okEmpty = Validator::make([], $rules);
    expect($okEmpty->passes())->toBeTrue();
    $ok = Validator::make(['score'=>85], $rules);
    expect($ok->passes())->toBeTrue();
    $failHigh = Validator::make(['score'=>150], $rules);
    expect($failHigh->fails())->toBeTrue();
    $failLow = Validator::make(['score'=>-5], $rules);
    expect($failLow->fails())->toBeTrue();
    $failStr = Validator::make(['score'=>'notnum'], $rules);
    expect($failStr->fails())->toBeTrue();
});

test('SyncAssessmentRequest validates', function () {
    $rules = rulesFor(SyncAssessmentRequest::class);
    $ok = Validator::make(['semester'=>'Semester 2','source_semester'=>'20251'], $rules);
    expect($ok->passes())->toBeTrue();
    $okEmpty = Validator::make([], $rules);
    expect($okEmpty->passes())->toBeTrue();
});

// ─── UpdateDeadlineNotificationRequest ───
test('UpdateDeadlineNotificationRequest validates', function () {
    $rules = rulesFor(UpdateDeadlineNotificationRequest::class);
    expect($rules)->toHaveKey('deadline_notification');
    $fail = Validator::make([], $rules);
    expect($fail->fails())->toBeTrue();
    $ok = Validator::make(['deadline_notification'=>'3 days left'], $rules);
    expect($ok->passes())->toBeTrue();
});

// ─── UpdateNotificationChannelRequest ───
test('UpdateNotificationChannelRequest validates in', function () {
    $rules = rulesFor(UpdateNotificationChannelRequest::class);
    expect($rules['notification_channel'])->toContain('in:email,telegram,both');
    $fail = Validator::make(['notification_channel'=>'invalid'], $rules);
    expect($fail->fails())->toBeTrue();
    foreach (['email','telegram','both'] as $v) {
        expect(Validator::make(['notification_channel'=>$v], $rules)->passes())->toBeTrue();
    }
});

// ─── UpdateTelegramChatIdRequest ───
test('UpdateTelegramChatIdRequest validates', function () {
    $rules = rulesFor(UpdateTelegramChatIdRequest::class);
    expect($rules)->toHaveKey('telegram_chat_id');
    $okNull = Validator::make(['telegram_chat_id'=>null], $rules);
    expect($okNull->passes())->toBeTrue();
    $okEmpty = Validator::make([], $rules);
    expect($okEmpty->passes())->toBeTrue();
    $ok = Validator::make(['telegram_chat_id'=>'123456'], $rules);
    expect($ok->passes())->toBeTrue();
    $failLong = Validator::make(['telegram_chat_id'=>str_repeat('a',65)], $rules);
    expect($failLong->fails())->toBeTrue();
});

// ─── StoreSiakangCredentialsRequest ───
test('StoreSiakangCredentialsRequest validates', function () {
    $rules = rulesFor(StoreSiakangCredentialsRequest::class);
    expect($rules)->toHaveKeys(['siakang_email','siakang_password']);
    $fail = Validator::make(['siakang_email'=>'notemail','siakang_password'=>''], $rules);
    expect($fail->fails())->toBeTrue();
    $ok = Validator::make(['siakang_email'=>'student@student.untirta.ac.id','siakang_password'=>'secret'], $rules);
    expect($ok->passes())->toBeTrue();
});

// ─── StoreGradeRequest ───
test('StoreGradeRequest validates', function () {
    $user = User::factory()->create();
    $request = new StoreGradeRequest();
    $request->setUserResolver(fn() => $user);
    $request->setContainer(app());
    $rules = $request->rules();
    expect($rules)->toHaveKeys(['grade','grade_point','minimal_score','maximal_score']);
    $fail = Validator::make(['grade'=>'','grade_point'=>'notnum','minimal_score'=>-1,'maximal_score'=>101], $rules);
    expect($fail->fails())->toBeTrue();
    $ok = Validator::make(['grade'=>'A','grade_point'=>4.00,'minimal_score'=>85,'maximal_score'=>100], $rules);
    expect($ok->passes())->toBeTrue();
    // unique per user tested via feature; rule presence check
    expect($rules['grade'])->toContain('required');
});

// ─── UpdateGradeRequest ───
test('UpdateGradeRequest validates with ignore', function () {
    $user = User::factory()->create();
    $grade = Grade::create(['grade'=>'A','grade_point'=>4.00,'minimal_score'=>85,'maximal_score'=>100,'user_id'=>$user->id]);
    $request = new UpdateGradeRequest();
    $request->setRouteResolver(fn() => new class($grade) {
        public function __construct(private $grade) {}
        public function getName(){ return 'grades.update'; }
        public function parameter($key, $default=null){ return $key==='grade' ? $this->grade->id : $default; }
    });
    // Need to set user resolver for $this->user()
    $request->setContainer(app());
    $request->setUserResolver(fn() => $user);
    $rules = $request->rules();
    expect($rules)->toHaveKey('grade');
    // same grade should pass due to ignore
    $ok = Validator::make(['grade'=>'A','grade_point'=>3.50,'minimal_score'=>80,'maximal_score'=>100], $rules);
    expect($ok->passes())->toBeTrue();
    // duplicate for same user without ignore would fail, but with ignore it passes
    $fail = Validator::make(['grade'=>'','grade_point'=>'','minimal_score'=>-5,'maximal_score'=>200], $rules);
    expect($fail->fails())->toBeTrue();
});

// ─── UpdateProfileRequest ───
test('UpdateProfileRequest validates', function () {
    $user = User::factory()->create(['email'=>'me@example.com']);
    $requestTmp = new UpdateProfileRequest();
    $requestTmp->setUserResolver(fn() => $user);
    $requestTmp->setContainer(app());
    $rules = $requestTmp->rules();
    expect($rules)->toHaveKeys(['name','email']);
    $fail = Validator::make(['name'=>'','email'=>'notemail'], $rules);
    expect($fail->fails())->toBeTrue();
    $request = new UpdateProfileRequest();
    $request->setUserResolver(fn() => $user);
    $request->setContainer(app());
    $rulesWithUser = $request->rules();
    $ok = Validator::make(['name'=>'New','email'=>'new@example.com'], $rulesWithUser);
    expect($ok->passes())->toBeTrue();
    $okSame = Validator::make(['name'=>'New','email'=>'me@example.com'], $rulesWithUser);
    expect($okSame->passes())->toBeTrue();
    User::factory()->create(['email'=>'taken@example.com']);
    $dup = Validator::make(['name'=>'New','email'=>'taken@example.com'], $rulesWithUser);
    expect($dup->fails())->toBeTrue();
});

// ─── ChangePasswordRequest ───
test('ChangePasswordRequest validates', function () {
    $rules = rulesFor(ChangePasswordRequest::class);
    expect($rules)->toHaveKeys(['old_password','password','password_confirmation']);
    $fail = Validator::make(['old_password'=>'','password'=>'short','password_confirmation'=>'diff'], $rules);
    expect($fail->fails())->toBeTrue();
    $ok = Validator::make(['old_password'=>'oldpass','password'=>'newpassword1','password_confirmation'=>'newpassword1'], $rules);
    expect($ok->passes())->toBeTrue();
    $failSame = Validator::make(['old_password'=>'old','password'=>'newpassword1','password_confirmation'=>'different'], $rules);
    expect($failSame->fails())->toBeTrue();
});

// ─── SendResetLinkRequest ───
test('SendResetLinkRequest validates', function () {
    $rules = rulesFor(SendResetLinkRequest::class);
    expect($rules)->toHaveKey('email');
    $fail = Validator::make(['email'=>'notemail'], $rules);
    expect($fail->fails())->toBeTrue();
    $ok = Validator::make(['email'=>'test@example.com'], $rules);
    expect($ok->passes())->toBeTrue();
});

// ─── ResetPasswordRequest ───
test('ResetPasswordRequest validates', function () {
    $rules = rulesFor(ResetPasswordRequest::class);
    expect($rules)->toHaveKeys(['email','token','password','password_confirmation']);
    $fail = Validator::make([], $rules);
    expect($fail->fails())->toBeTrue();
    $failShort = Validator::make(['email'=>'a@b.com','token'=>'tok','password'=>'short','password_confirmation'=>'short'], $rules);
    expect($failShort->fails())->toBeTrue();
    $ok = Validator::make(['email'=>'a@b.com','token'=>'tok','password'=>'password123','password_confirmation'=>'password123'], $rules);
    expect($ok->passes())->toBeTrue();
    $failMismatch = Validator::make(['email'=>'a@b.com','token'=>'tok','password'=>'password123','password_confirmation'=>'diff'], $rules);
    expect($failMismatch->fails())->toBeTrue();
});
