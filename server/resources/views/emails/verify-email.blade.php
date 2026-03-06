@extends('emails.layouts.base')

@section('content')
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#0a0f1a;">Hi {{ $userName }},</p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#0a0f1a;">Thank you for registering! Please verify your
        email address by clicking the button below.</p>

    @include('emails.components.button', [
        'url' => $verificationUrl,
        'label' => 'Verify Email Address',
    ])

    <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#64748b;">If you did not create an account, you can safely
        ignore this email.</p>
@endsection
