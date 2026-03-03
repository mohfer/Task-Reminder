@props(['url', 'label'])

<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;">
    <tr>
        <td align="center" bgcolor="#3b82f6" style="border-radius:8px;">
            <a href="{{ $url }}" target="_blank"
                style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:600;line-height:1.2;color:#ffffff;text-decoration:none;">
                {{ $label }}
            </a>
        </td>
    </tr>
</table>
