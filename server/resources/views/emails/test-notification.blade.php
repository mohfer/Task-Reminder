@extends('emails.layouts.base')

@section('content')
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#0a0f1a;">Hi {{ $userName }},</p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#0a0f1a;">This is a dummy notification from
        Task Reminder.</p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#0a0f1a;">If you receive this email, your
        notification setup is working correctly.</p>

    @include('emails.components.button', [
        'url' => $dashboardUrl,
        'label' => 'Open Dashboard',
    ])

    <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#64748b;">You can safely ignore this message.</p>
@endsection
