@extends('emails.layouts.base')

@section('content')
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#0a0f1a;">Hi {{ $userName }},</p>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#0a0f1a;">You have <strong>{{ $count }}</strong>
        {{ $taskWord }} to complete.</p>

    @foreach ($notifications as $item)
        @include('emails.components.task-card', [
            'courseContent' => $item['course_content'],
            'task' => $item['task'],
            'deadline' => $item['deadline'],
            'deadlineLabel' => $item['deadline_label'] ?? null,
            'deadlineLabelColor' => $item['deadline_color'] ?? null,
            'priority' => $item['priority'] ?? false,
        ])
    @endforeach

    @include('emails.components.button', [
        'url' => $dashboardUrl,
        'label' => 'Open Dashboard',
    ])

    <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#64748b;">{{ \App\Services\TelegramService::DASHBOARD_HINT }}</p>
@endsection
