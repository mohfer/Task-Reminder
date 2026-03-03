@extends('emails.layouts.base')

@section('content')
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#0a0f1a;">Hi {{ $userName }},</p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#0a0f1a;">We received a request to reset your password.
    </p>

    @include('emails.components.button', [
        'url' => $resetUrl,
        'label' => 'Reset Password',
    ])

    <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#64748b;">If you did not request a password reset, you can
        safely ignore this email.</p>
@endsection
