@extends('emails.layouts.base')

@section('content')
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#0a0f1a;">Hi {{ $userName }},</p>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#0a0f1a;">You have <strong>{{ $count }}</strong>
        {{ $taskWord }} to complete.</p>

    @foreach ($notifications as $item)
        @include('emails.components.task-card', [
            'courseContent' => $item['course_content'],
            'task' => $item['task'],
            'description' => $item['description'] ?? null,
            'deadline' => $item['deadline'],
        ])
    @endforeach

    @include('emails.components.button', [
        'url' => $dashboardUrl,
        'label' => 'View Dashboard',
    ])

    <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#64748b;">Please check your dashboard and prioritize tasks
        with the nearest deadline.</p>
@endsection
