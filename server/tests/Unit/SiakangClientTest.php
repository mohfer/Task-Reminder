<?php

use App\Services\SiakangClient;
use Illuminate\Support\Facades\Process;
use Tests\TestCase;

uses(TestCase::class);

test('run decodes a successful JSON response from the bridge', function () {
    Process::fake([
        '*' => Process::result(json_encode([
            'code' => 200,
            'message' => 'Success',
            'data' => [['code' => '20251', 'name' => '2025/2026 Gasal', 'active' => true]],
        ])),
    ]);

    $client = new SiakangClient;
    $result = $client->run(['action' => 'list_semesters', 'email' => 'a@b.c', 'password' => 'secret']);

    expect($result['code'])->toBe(200);
    expect($result['data'])->toHaveCount(1);
    expect($result['data'][0]['code'])->toBe('20251');
});

test('run throws when the bridge exits with a non-zero code', function () {
    Process::fake([
        '*' => Process::result('some error', '', 500),
    ]);

    $client = new SiakangClient;
    $client->run(['action' => 'ping']);
})->throws(Exception::class, 'Siakang sync process failed');

test('run throws on malformed non-JSON output', function () {
    Process::fake([
        '*' => Process::result('not json'),
    ]);

    $client = new SiakangClient;
    $client->run(['action' => 'ping']);
})->throws(Exception::class, 'Unexpected response from Siakang bridge');
