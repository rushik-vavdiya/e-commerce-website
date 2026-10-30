function createOtpEmail(otp, length = 6, expiresInMinutes = 10, title = "Your verification code") {
  const code = String(otp);

  if (!new RegExp(`^\\d{${length}}$`).test(code)) {
    throw new Error(`OTP must contain exactly ${length} digits`);
  }

  return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Your verification code</title>
	</head>
	<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
		<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#f3f4f6;">
			<tr>
				<td align="center">
					<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:12px;">
						<tr>
							<td align="center" style="padding:36px 32px 16px;">
								<h1 style="margin:0;font-size:24px;color:#111827;">${title}</h1>
								<p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#6b7280;">Enter this one-time code to continue. It is valid for ${expiresInMinutes} minutes.</p>
							</td>
						</tr>
						<tr>
							<td align="center" style="padding:20px 32px 28px;">
								<div style="display:inline-block;padding:16px 24px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;color:#2563eb;font-size:32px;font-weight:bold;letter-spacing:8px;">${code}</div>
							</td>
						</tr>
						<tr>
							<td align="center" style="padding:0 32px 36px;">
								<p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">If you didn’t request this code, you can ignore this email. Never share your code with anyone.</p>
							</td>
						</tr>
					</table>
					<p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">This is an automated email. Please do not reply.</p>
				</td>
			</tr>
		</table>
	</body>
</html>`;
}

export default createOtpEmail;
