import nodemailer from "nodemailer";

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  message: string;
  configured: boolean;
  verificationLink: string;
}

function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

function createTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  return null;
}

export const emailService = {
  /**
   * Sends a real transactional email verification message
   */
  async sendVerificationEmail(
    toEmail: string,
    token: string,
    userName: string = "Citizen"
  ): Promise<EmailSendResult> {
    const appUrl = getAppUrl();
    const verificationLink = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;
    const fromAddress = process.env.EMAIL_FROM || '"JanSeva AI Civic Network" <noreply@janseva.gov.in>';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-[#4B3BD5]">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your JanSeva Account</title>
</head>
<body style="margin:0; padding:0; background-color:#F4F6FB; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#172033;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F4F6FB; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" border="0" cellspacing="0" cellpadding="0" style="max-width:540px; background-color:#ffffff; border-radius:24px; border:1px solid #DFE5EF; box-shadow:0 4px 20px rgba(10,31,68,0.05); overflow:hidden;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color:#4B3BD5; padding:32px 40px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:24px; font-weight:800; letter-spacing:-0.5px;">
                Jan<span style="color:#F0EFFF;">Seva</span> <span style="font-size:11px; text-transform:uppercase; background-color:rgba(255,255,255,0.2); padding:3px 8px; border-radius:6px; vertical-align:middle;">AI 2.0</span>
              </h1>
              <p style="color:#F0EFFF; margin:6px 0 0 0; font-size:12px; font-weight:500;">
                AI Civic Social Network & Municipal Portal
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding:40px; text-align:left;">
              <h2 style="margin:0 0 12px 0; font-size:20px; font-weight:700; color:#172033;">
                Verify Your Email Address
              </h2>
              <p style="margin:0 0 20px 0; font-size:14px; line-height:1.6; color:#657089;">
                Namaste <strong>${userName}</strong>,<br><br>
                Thank you for joining JanSeva! Please confirm that <strong>${toEmail}</strong> belongs to you by clicking the verification button below.
              </p>

              <!-- Verification Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:28px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationLink}" target="_blank" style="display:inline-block; background-color:#4B3BD5; color:#ffffff; font-weight:700; font-size:14px; padding:14px 32px; border-radius:12px; text-decoration:none; box-shadow:0 4px 12px rgba(75,59,213,0.3);">
                      Verify My Email &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 12px 0; font-size:12px; color:#657089; line-height:1.5;">
                If the button above doesn&apos;t work, copy and paste this verification link directly into your browser:
              </p>
              <p style="margin:0 0 24px 0; font-size:11px; word-break:break-all; background-color:#F7F9FC; padding:10px 14px; border-radius:8px; border:1px solid #DFE5EF;">
                <a href="${verificationLink}" style="color:#4B3BD5; text-decoration:underline;">${verificationLink}</a>
              </p>

              <div style="border-top:1px solid #DFE5EF; padding-top:16px; margin-top:24px; font-size:11px; color:#657089;">
                <p style="margin:0 0 4px 0;">⏰ <strong>Link Expiration:</strong> This link will expire in 24 hours.</p>
                <p style="margin:0;">🔒 If you did not create a JanSeva account, you can safely ignore this email.</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F7F9FC; border-top:1px solid #DFE5EF; padding:20px 40px; text-align:center; font-size:11px; color:#657089;">
              &copy; 2026 JanSeva Municipal Civic Portal. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const textContent = `
Namaste ${userName},

Thank you for joining JanSeva! Please verify your email address by opening the following link in your browser:

${verificationLink}

This link will expire in 24 hours.

If you did not request this, please ignore this message.

JanSeva Civic Platform Team
    `.trim();

    const transporter = createTransporter();

    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: fromAddress,
          to: toEmail,
          subject: "Verify your email address - JanSeva AI Civic Network",
          text: textContent,
          html: htmlContent,
        });

        return {
          success: true,
          messageId: info.messageId,
          configured: true,
          verificationLink,
          message: `Verification email dispatched successfully to ${toEmail} via SMTP.`,
        };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "SMTP transport error";
        return {
          success: false,
          configured: true,
          verificationLink,
          message: `SMTP delivery failed: ${errorMsg}. Verification link generated: ${verificationLink}`,
        };
      }
    }

    // If SMTP is not yet configured in process.env, provide explicit status
    return {
      success: false,
      configured: false,
      verificationLink,
      message: `SMTP environment variables (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD) not configured. Verification token registered for link: ${verificationLink}`,
    };
  },
};
