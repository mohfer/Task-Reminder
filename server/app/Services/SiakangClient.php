<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

class SiakangClient
{
    private const RUNNER = 'run.py';

    private function scriptPath(): string
    {
        return base_path('siakang-sync/'.self::RUNNER);
    }

    /**
     * Run a command against the Python bridge and decode its JSON response.
     *
     * @param  array<string, mixed>  $payload
     */
    public function run(array $payload, int $timeout = 60): array
    {
        $cwd = base_path('siakang-sync');
        [$command, $env] = $this->pythonCommand();

        $result = Process::timeout($timeout)
            ->path($cwd)
            ->env(array_merge([
                'PYTHONUNBUFFERED' => '1',
            ], $env))
            ->input(json_encode($payload))
            ->run($command);

        if ($result->exitCode() !== 0) {
            Log::error('Siakang sync process failed', [
                'exit_code' => $result->exitCode(),
                'error' => $result->errorOutput(),
                'output' => $result->output(),
            ]);

            throw new \Exception('Siakang sync process failed: '.trim($result->errorOutput() ?: $result->output()), 500);
        }

        $decoded = json_decode($result->output(), true);

        if (! is_array($decoded) || ! isset($decoded['code'])) {
            throw new \Exception('Unexpected response from Siakang bridge', 500);
        }

        return $decoded;
    }

    /**
     * Resolve the Python interpreter command. Prefer running the venv's python
     * directly (no runtime `uv` dependency); fall back to `uv run`.
     *
     * @return array{0: array<int, string>, 1: array<string, string>}
     */
    private function pythonCommand(): array
    {
        $venv = $this->venvPython();

        if ($venv && is_file($venv)) {
            return [[$venv, $this->scriptPath()], []];
        }

        return [['uv', 'run', 'python', $this->scriptPath()], []];
    }

    private function venvPython(): ?string
    {
        $candidate = base_path('siakang-sync/.venv/bin/python');

        return is_file($candidate) ? $candidate : null;
    }

    public function listSemesters(string $email, string $password): array
    {
        return $this->run([
            'action' => 'list_semesters',
            'email' => $email,
            'password' => $password,
        ]);
    }

    public function verify(string $email, string $password): array
    {
        return $this->run([
            'action' => 'verify',
            'email' => $email,
            'password' => $password,
        ]);
    }

    public function getGrades(string $email, string $password, ?string $semester = null): array
    {
        return $this->run([
            'action' => 'get_grades',
            'email' => $email,
            'password' => $password,
            'semester' => $semester,
        ]);
    }

    public function getSchedule(string $email, string $password, ?string $semester = null): array
    {
        return $this->run([
            'action' => 'get_schedule',
            'email' => $email,
            'password' => $password,
            'semester' => $semester,
        ], 120);
    }
}
