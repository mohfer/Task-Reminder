@extends('emails.layouts.base')

@section('content')
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#0a0f1a;">Hi {{ $userName }},</p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#0a0f1a;">You just created a new task. Here are the
        details:</p>

    @include('emails.components.task-card', [
        'courseContent' => $courseContent,
        'task' => $task,
        'description' => $description,
        'deadline' => $deadline,
    ])

    @include('emails.components.button', [
        'url' => $dashboardUrl,
        'label' => 'View Dashboard',
    ])

    <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#64748b;">Thank you for using our application.</p>
@endsection
