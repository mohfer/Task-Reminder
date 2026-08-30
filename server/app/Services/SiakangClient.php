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
            $stderr = trim($result->errorOutput());
            $stdout = trim($result->output());
            $detail = $stderr ?: $stdout;

            Log::error('Siakang sync process failed', [
                'exit_code' => $result->exitCode(),
                'command' => $command,
                'error' => $stderr,
                'output' => $stdout,
            ]);

            throw new \Exception(
                'Siakang sync process failed (exit '.$result->exitCode().'): '.($detail !== '' ? $detail : $this->scriptPath().' — check that the Python environment is set up via `cd server/siakang-sync && uv sync`.')
            );
        }

        $decoded = json_decode($result->output(), true);

        if (! is_array($decoded) || ! isset($decoded['code'])) {
            throw new \Exception('Unexpected response from Siakang bridge', 500);
        }

        return $decoded;
    }

    /**
     * Resolve the Python interpreter command.
     *
     * Prefer the in-repo `.venv/bin/python` created by `uv sync` — it is the
     * exact locked environment, so `uv` does not need to be on the runtime PATH.
     * Fall back to `uv run` (locked env too) when the venv is missing, then to
     * a bare `python3` as a last resort.
     *
     * @return array{0: array<int, string>, 1: array<string, string>}
     */
    private function pythonCommand(): array
    {
        $venv = $this->venvPython();

        if ($venv && is_file($venv)) {
            return [[$venv, $this->scriptPath()], []];
        }

        $uv = $this->findUv();

        if ($uv !== null) {
            return [[$uv, 'run', '--project', '.', 'python', $this->scriptPath()], []];
        }

        return [['python3', $this->scriptPath()], []];
    }

    /**
     * Locate the uv binary, preferring an explicit path so a process running
     * under Octane/FrankenPHP with a restricted PATH still finds it.
     */
    private function findUv(): ?string
    {
        $candidates = array_filter([
            env('SIAKANG_UV'),
            $_SERVER['SIAKANG_UV'] ?? null,
            '/root/.local/bin/uv',
            '/usr/local/bin/uv',
            '/home/'.(getenv('USER') ?: 'root').'/.local/bin/uv',
        ]);

        foreach ($candidates as $candidate) {
            if (is_file($candidate) && is_executable($candidate)) {
                return $candidate;
            }
        }

        if ($this->commandExists('uv')) {
            return 'uv';
        }

        return null;
    }

    private function commandExists(string $bin): bool
    {
        $result = Process::timeout(5)->run(['sh', '-c', 'command -v '.escapeshellarg($bin)]);

        return $result->exitCode() === 0;
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
