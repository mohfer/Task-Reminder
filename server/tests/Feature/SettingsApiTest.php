<?php

use App\Models\Setting;
use App\Models\User;
use App\Services\SiakangClient;
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
