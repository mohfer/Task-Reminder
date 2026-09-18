@props(['courseContent', 'task', 'deadline' => null, 'deadlineLabel' => null, 'deadlineLabelColor' => null, 'priority' => false, 'status' => null])

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="border:1px solid #e2e8f0;background-color:#ffffff;border-radius:10px;margin:12px 0;">
    <tr>
        <td style="padding:14px 16px;">
            <p style="margin:0 0 8px;font-size:12px;color:#64748b;">Course Content</p>
            <p style="margin:0 0 10px;font-size:15px;font-weight:600;color:#0a0f1a;">{{ $courseContent }}</p>

            <p style="margin:0 0 8px;font-size:12px;color:#64748b;">Task</p>
            <p style="margin:0 0 10px;font-size:15px;font-weight:600;color:#0a0f1a;">{{ $task }}@if (!empty($priority))<span
                    style="display:inline-block;padding:2px 10px;border-radius:999px;background-color:#dc2626;color:#ffffff;font-size:12px;font-weight:600;margin-left:8px;vertical-align:middle;">Priority</span>@endif</p>

            @if (!empty($deadline))
                <p style="margin:0 0 8px;font-size:12px;color:#64748b;">Deadline</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#0a0f1a;">{{ $deadline }}@if (!empty($deadlineLabel))<span
                        style="display:inline-block;padding:2px 10px;border-radius:999px;background-color:{{ $deadlineLabelColor ?? '#64748b' }};color:#ffffff;font-size:12px;font-weight:600;margin-left:8px;vertical-align:middle;">{{ $deadlineLabel }}</span>@endif</p>
            @endif

            @if (!empty($status))
                <p style="margin:10px 0 0;">
                    <span
                        style="display:inline-block;padding:4px 10px;border-radius:999px;background-color:{{ $status === 'Completed' ? '#16a34a' : '#ef4444' }};color:#ffffff;font-size:12px;font-weight:600;">
                        {{ $status }}
                    </span>
                </p>
            @endif
        </td>
    </tr>
</table>
