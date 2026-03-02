<?php

namespace App\Traits;

trait FormatsNotificationDescription
{
    private function addDescriptionLines($mailMessage, ?string $description): void
    {
        if (!$description) {
            return;
        }

        $lines = preg_split('/\r\n|\r|\n/', $description);

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed !== '') {
                if (str_starts_with($trimmed, '-')) {
                    $mailMessage->line('**' . $trimmed . '**');
                } else {
                    $mailMessage->line($trimmed);
                }
            }
        }
    }
}
