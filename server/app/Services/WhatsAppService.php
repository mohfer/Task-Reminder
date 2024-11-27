<?php

namespace App\Services;

use Twilio\Rest\Client;

class WhatsAppService
{
    protected $client;

    public function __construct()
    {
        $this->client = new Client(
            env('TWILIO_SID'),
            env('TWILIO_AUTH_TOKEN')
        );
    }

    public function sendMessage($to, $message)
    {
        $from = env('TWILIO_WHATSAPP_NUMBER');

        return $this->client->messages->create(
            "whatsapp:$to",
            [
                'from' => $from,
                'body' => $message,
            ]
        );
    }
}
