import { Resend } from "resend";

function getResend() {
    return new Resend(process.env.RESEND_API_KEY);
}

export async function sendVerificationEmail(
    email: string,
    name: string,
    token: string
) {
    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;

    await getResend().emails.send({
        from: "NimeNime <shiki21@nime-nime.web.id>",
        to: email,
        subject: "Verify your NimeNime account",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#201f31;font-family:'Inter',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#201f31;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#27263a;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffbade;">NimeNime 🎌</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#9c9c9c;">Anime Streaming Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#ffffff;">Hi <strong>${name}</strong>,</p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#9c9c9c;">
                Thanks for signing up! Please verify your email address to activate your account and start watching anime.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" style="display:inline-block;background-color:#ffbade;color:#191826;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:999px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#9c9c9c;">
                This link will expire in <strong style="color:#ffffff;">24 hours</strong>. If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;font-size:11px;color:#9c9c9c;">
                &copy; ${new Date().getFullYear()} NimeNime &mdash; nime-nime.web.id
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `.trim(),
    });
}
