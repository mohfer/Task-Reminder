<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? config('app.name') }}</title>
</head>

<body
    style="margin:0;padding:0;background-color:#fafafa;color:#0a0f1a;font-family:Poppins,'Segoe UI',Tahoma,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
        style="background-color:#fafafa;padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
                    style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                    <tr>
                        <td style="background-color:#3b82f6;padding:18px 24px;">
                            <h1 style="margin:0;font-size:20px;font-weight:600;line-height:1.3;color:#ffffff;">
                                {{ config('app.name', 'Reminder') }}</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px;">
                            @yield('content')
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 24px 24px;">
                            @include('emails.components.footer')
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
