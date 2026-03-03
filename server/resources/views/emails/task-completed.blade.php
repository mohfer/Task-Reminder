@extends('emails.layouts.base')

@section('content')
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#0a0f1a;">Hi {{ $userName }},</p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#0a0f1a;">Great job! You completed a task:</p>

    @include('emails.components.task-card', [
        'courseContent' => $courseContent,
        'task' => $task,
        'description' => $description,
        'status' => 'Completed',
    ])

    @include('emails.components.button', [
        'url' => $dashboardUrl,
        'label' => 'View Dashboard',
    ])

    <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#64748b;">Keep your momentum and complete your remaining
        tasks.</p>
@endsection
