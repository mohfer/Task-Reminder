<?php

use App\Models\Setting;
use App\Models\User;
use App\Notifications\TestNotification;
use App\Services\SiakangClient;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create(['email_verified_at' => now()]);
    Sanctum::actingAs($this->user, ['*']);
    // AuthService::register creates settings, but here we test manually
    Setting::create([
        'deadline_notification' => '5 days left',
        'task_created_notification' => 1,
        'task_completed_notification' => 1,
        'notification_channel' => Setting::CHANNEL_EMAIL,
        'telegram_chat_id' => null,
        'user_id' => $this->user->id,
    ]);
    $this->siakangClient = Mockery::mock(SiakangClient::class);
    $this->app->instance(SiakangClient::class, $this->siakangClient);
});

// ─── GET /api/settings ───

test('get settings returns user settings', function () {
    $response = $this->getJson('/api/settings');

    $response->assertOk()
        ->assertJsonPath('code', 200)
        ->assertJsonPath('data.deadline_notification', '5 days left');
});

// ─── PUT /api/settings/deadline-notification ───

test('update deadline notification', function () {
    $response = $this->putJson('/api/settings/deadline-notification', [
        'deadline_notification' => '3 days left',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.deadline_notification', '3 days left');
});

// ─── PUT /api/settings/notification-channel ───

test('update notification channel validates allowed values', function () {
    $response = $this->putJson('/api/settings/notification-channel', [
        'notification_channel' => 'invalid',
    ]);

    $response->assertStatus(422);
});

test('update notification channel to email works', function () {
    $response = $this->putJson('/api/settings/notification-channel', [
        'notification_channel' => 'email',
    ]);

    $response->assertOk();
});

// ─── PUT /api/settings/telegram-chat-id ───

test('update telegram chat id', function () {
    $response = $this->putJson('/api/settings/telegram-chat-id', [
        'telegram_chat_id' => '123456789',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.telegram_chat_id', '123456789');
});

test('update telegram chat id to null', function () {
    Setting::where('user_id', $this->user->id)->update(['telegram_chat_id' => '123456']);

    $response = $this->putJson('/api/settings/telegram-chat-id', [
        'telegram_chat_id' => null,
    ]);

    $response->assertOk();
});

// ─── PATCH /api/settings/task-created-notification ───

test('toggle task created notification', function () {
    $response = $this->patchJson('/api/settings/task-created-notification');

    $response->assertOk()
        ->assertJsonPath('data.task_created_notification', 0);
});

// ─── PATCH /api/settings/task-completed-notification ───

test('toggle task completed notification', function () {
    $response = $this->patchJson('/api/settings/task-completed-notification');

    $response->assertOk()
        ->assertJsonPath('data.task_completed_notification', 0);
});

// ─── POST /api/settings/test-notification ───

test('test notification sends email synchronously', function () {
    Notification::fake();

    $response = $this->postJson('/api/settings/test-notification');

    $response->assertOk()
        ->assertJsonPath('message', 'Test notification sent to Email');

    Notification::assertSentTo($this->user, TestNotification::class);
});

test('test notification sends both channels synchronously', function () {
    Notification::fake();
    config()->set('services.telegram.bot_token', 'dummy-token');
    Http::fake([
        'api.telegram.org/*' => Http::response(['ok' => true], 200),
    ]);

    Setting::where('user_id', $this->user->id)->update([
        'notification_channel' => Setting::CHANNEL_BOTH,
        'telegram_chat_id' => '12345',
    ]);

    $response = $this->postJson('/api/settings/test-notification');

    $response->assertOk()
        ->assertJsonPath('message', 'Test notification sent to Email and Telegram');

    Notification::assertSentTo($this->user, TestNotification::class);
    Http::assertSent(function ($request) {
        return $request['chat_id'] === '12345'
            && str_contains($request['text'], 'Test Notification');
    });
});

test('test notification returns 502 when telegram delivery fails', function () {
    Notification::fake();
    config()->set('services.telegram.bot_token', '');

    Setting::where('user_id', $this->user->id)->update([
        'notification_channel' => Setting::CHANNEL_TELEGRAM,
        'telegram_chat_id' => '12345',
    ]);

    $response = $this->postJson('/api/settings/test-notification');

    $response->assertStatus(502);
});

// ─── PUT /api/settings/siakang-credentials ───

test('stores siakang credentials when verification succeeds', function () {
    $this->siakangClient->shouldReceive('verify')
        ->once()
        ->with('student@student.untirta.ac.id', 'secret')
        ->andReturn(['code' => 200, 'message' => 'Success', 'data' => ['ok' => true]]);

    $response = $this->putJson('/api/settings/siakang-credentials', [
        'siakang_email' => 'student@student.untirta.ac.id',
        'siakang_password' => 'secret',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.has_siakang_credentials', true);

    expect(Setting::first()->hasSiakangCredentials())->toBeTrue();
});

test('returns 401 and does not store credentials when verification fails', function () {
    $this->siakangClient->shouldReceive('verify')
        ->once()
        ->andReturn(['code' => 401, 'message' => 'Login failed — check email/password']);

    $response = $this->putJson('/api/settings/siakang-credentials', [
        'siakang_email' => 'student@student.untirta.ac.id',
        'siakang_password' => 'wrong',
    ]);

    $response->assertStatus(401)
        ->assertJsonPath('message', 'Login failed — check email/password');

    expect(Setting::first()->hasSiakangCredentials())->toBeFalse();
});

// ─── POST /api/settings/siakang-credentials/test ───

test('test connection succeeds with stored credentials', function () {
    Setting::first()->update([
        'siakang_email' => 'student@student.untirta.ac.id',
        'siakang_password' => 'secret',
    ]);

    $this->siakangClient->shouldReceive('verify')
        ->once()
        ->with('student@student.untirta.ac.id', 'secret')
        ->andReturn(['code' => 200, 'message' => 'Success', 'data' => ['ok' => true]]);

    $response = $this->postJson('/api/settings/siakang-credentials/test');

    $response->assertOk()
        ->assertJsonPath('message', 'Siakang connection successful')
        ->assertJsonPath('data.email', 'student@student.untirta.ac.id')
        ->assertJsonMissingPath('data.siakang_password');
});

test('test connection returns 401 when stored credentials are rejected', function () {
    Setting::first()->update([
        'siakang_email' => 'student@student.untirta.ac.id',
        'siakang_password' => 'stale',
    ]);

    $this->siakangClient->shouldReceive('verify')
        ->once()
        ->andReturn(['code' => 401, 'message' => 'Login failed — check email/password']);

    $response = $this->postJson('/api/settings/siakang-credentials/test');

    $response->assertStatus(401);
});

test('test connection returns 422 when no credentials are stored', function () {
    $this->siakangClient->shouldNotReceive('verify');

    $response = $this->postJson('/api/settings/siakang-credentials/test');

    $response->assertStatus(422);
});
