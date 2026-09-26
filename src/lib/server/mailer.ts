import nodemailer from 'nodemailer';

interface SendMailOptions {
  to: string;
  code: string;
}

export interface StudentApprovalEmailOptions {
  to: string;
  name: string;
  rollNo: string;
  email: string;
  password?: string;
  classroomName: string;
  classroomCode: string;
  adminName?: string;
}

interface MailResult {
  success: boolean;
  message?: string;
}

/**
 * Escapes unsafe characters for HTML interpolation to prevent email XSS/injection attacks.
 */
export function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Checks if email dispatching (SMTP or Resend API) is configured.
 */
export const isEmailConfigured = (): boolean => {
  return !!(
    process.env.RESEND_API_KEY ||
    (process.env.SMTP_USER && process.env.SMTP_PASS) ||
    (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
};

export const isSmtpConfigured = (): boolean => {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
};

const getSmtpTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: process.env.SMTP_ALLOW_SELFSIGNED === 'true' ? false : true },
  });
};

const sendViaResend = async (opts: { to: string; subject: string; text: string; html: string }): Promise<MailResult> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, message: 'Resend API key missing' };

  try {
    const from = process.env.MAIL_FROM || 'Classmate <onboarding@resend.dev>';
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return { success: false, message: err?.message || 'Resend API error' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to dispatch via Resend' };
  }
};

const sendViaSmtp = async (opts: { to: string; subject: string; text: string; html: string }): Promise<MailResult> => {
  const transporter = getSmtpTransporter();
  if (!transporter) return { success: false, message: 'SMTP credentials missing' };

  try {
    const from = process.env.MAIL_FROM || `"Classmate Hub" <${process.env.SMTP_USER}>`;
    await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    return { success: true };
  } catch (err: any) {
    console.error('SMTP sendMail error:', err);
    return { success: false, message: err?.message || 'SMTP dispatch error' };
  }
};

const dispatchEmail = async (opts: { to: string; subject: string; text: string; html: string }): Promise<MailResult> => {
  if (isSmtpConfigured()) {
    const res = await sendViaSmtp(opts);
    if (res.success) return res;
  }

  if (process.env.RESEND_API_KEY) {
    const res = await sendViaResend(opts);
    if (res.success) return res;
  }

  return { success: false, message: 'No email delivery provider configured or delivery failed.' };
};

/**
 * Sends a 6-digit OTP verification email with a classic, premium, fully responsive template.
 */
export const sendVerificationEmail = async ({ to, code }: SendMailOptions): Promise<MailResult> => {
  const safeCode = escapeHtml(code);
  const digits = code.split('').map(d => `
    <td class="otp-digit" align="center" valign="middle" style="background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border: 1.5px solid #0284c7; border-radius: 10px; font-family: ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace; font-size: 26px; font-weight: 800; color: #38bdf8; width: 44px; height: 52px; text-align: center; mso-padding-alt: 8px 0;">
      ${escapeHtml(d)}
    </td>
  `).join('<td class="otp-spacer" style="width: 6px;" width="6"></td>');

  const html = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      <title>Security Verification Code</title>
      <style type="text/css">
        @media only screen and (max-width: 480px) {
          .email-wrapper { padding: 12px 8px !important; }
          .email-card { padding: 24px 16px !important; border-radius: 16px !important; }
          .otp-digit { width: 36px !important; height: 46px !important; font-size: 20px !important; border-radius: 8px !important; }
          .otp-spacer { width: 3px !important; }
          .header-title { font-size: 22px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #080c14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table class="email-wrapper" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #080c14; padding: 36px 12px;">
        <tr>
          <td align="center">
            <table class="email-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 500px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);">
              <!-- Top Accent Gradient Bar -->
              <tr>
                <td style="height: 4px; background: linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #6366f1 100%); font-size: 0; line-height: 0;">&nbsp;</td>
              </tr>
              <!-- Brand Header -->
              <tr>
                <td style="padding: 32px 28px 20px 28px; text-align: center;">
                  <div style="display: inline-block; padding: 5px 14px; border-radius: 9999px; background-color: rgba(56, 189, 248, 0.1); color: #38bdf8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; border: 1px solid rgba(56, 189, 248, 0.25);">
                    &#128274; Security Verification
                  </div>
                  <h1 class="header-title" style="color: #ffffff; margin: 0 0 6px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">iClassmates</h1>
                  <p style="color: #94a3b8; font-size: 13px; margin: 0; font-weight: 500;">Student Workspace &amp; Academic Hub</p>
                </td>
              </tr>
              <!-- Verification Code Card -->
              <tr>
                <td style="padding: 0 24px 28px 24px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #172033; border: 1px solid #283548; border-radius: 14px; padding: 24px 20px;">
                    <tr>
                      <td align="center" style="padding-bottom: 18px;">
                        <p style="color: #cbd5e1; font-size: 13px; font-weight: 500; margin: 0; line-height: 1.5;">Please use the 6-digit verification code below to complete your sign-in:</p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto; table-layout: fixed;">
                          <tr>
                            ${digits}
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 20px;">
                        <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: rgba(248, 250, 252, 0.06); border: 1px solid rgba(248, 250, 252, 0.1); color: #94a3b8; font-size: 12px;">
                          &#9201; Valid for <strong style="color: #f8fafc;">10 minutes</strong> &bull; Single use only
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Security Tip -->
              <tr>
                <td style="padding: 0 28px 28px 28px; text-align: center;">
                  <div style="background-color: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; border-radius: 10px; padding: 12px 16px;">
                    <p style="color: #64748b; font-size: 11px; margin: 0; line-height: 1.5;">
                      &#128737; <strong>Security Notice:</strong> iClassmates staff or class representatives will never ask you for this code. Do not share it with anyone.
                    </p>
                  </div>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 0 28px 28px 28px; text-align: center; border-top: 1px solid #1e293b; padding-top: 20px;">
                  <p style="color: #64748b; font-size: 11px; margin: 0; line-height: 1.6;">
                    If you didn't request this verification code, you can safely ignore this email.<br />
                    &copy; ${new Date().getFullYear()} iClassmates Hub. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return dispatchEmail({
    to,
    subject: `🔐 ${safeCode} is your iClassmates verification code`,
    text: `Your iClassmates 6-digit verification code is: ${safeCode}. Valid for 10 minutes. Never share this code with anyone.`,
    html,
  });
};

/**
 * Sends an enrollment approval email with a classic, premium, fully responsive template.
 * Guarantees zero text overflow on mobile devices and conceals cryptographic password hashes.
 */
export const sendStudentApprovalEmail = async (opts: StudentApprovalEmailOptions): Promise<MailResult> => {
  const { to, name, rollNo, email, password, classroomName, classroomCode, adminName } = opts;

  const safeName = escapeHtml(name);
  const safeRollNo = escapeHtml(rollNo);
  const safeEmail = escapeHtml(email);
  const safeClassroom = escapeHtml(classroomName);
  const safeCode = escapeHtml(classroomCode);
  const safeAdmin = escapeHtml(adminName || 'Class Representative');

  // Guard against displaying cryptographic hashes (pbkdf2, bcrypt, argon2) to students
  const isHash = !password ||
    password.startsWith('pbkdf2:') ||
    password.startsWith('$2a$') ||
    password.startsWith('$2b$') ||
    password.startsWith('$argon2') ||
    (password.length > 35 && !password.includes(' '));

  const safePassword = isHash ? '' : escapeHtml(password);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const subject = `🎉 Enrollment Approved: Welcome to ${safeClassroom}!`;
  const text = `Hello ${name},\n\nYour request to join "${classroomName}" (Class Code: ${classroomCode}) has been approved!\n\nHere are your account credentials:\n- Student Name: ${name}\n- Roll No / USN: ${rollNo}\n- Login Email: ${email}\n- Classroom Code: ${classroomCode}\n- Access Password: ${isHash ? 'Password set during your enrollment' : password}\n\nYou can log in using either your Roll Number or Email along with your password.\nClass Representative: ${adminName || 'Class Representative'}\n\nOpen portal: ${appUrl}`;

  const html = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      <title>Enrollment Approved</title>
      <style type="text/css">
        @media only screen and (max-width: 480px) {
          .email-wrapper { padding: 12px 8px !important; }
          .email-card { padding: 24px 16px !important; border-radius: 16px !important; }
          .header-title { font-size: 22px !important; }
          .cred-table td { display: block !important; width: 100% !important; box-sizing: border-box !important; }
          .cred-label { padding-bottom: 2px !important; padding-top: 10px !important; }
          .cred-val { padding-bottom: 10px !important; padding-top: 0 !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #080c14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table class="email-wrapper" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #080c14; padding: 36px 12px;">
        <tr>
          <td align="center">
            <table class="email-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);">
              <!-- Top Accent Gradient Bar -->
              <tr>
                <td style="height: 4px; background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%); font-size: 0; line-height: 0;">&nbsp;</td>
              </tr>
              <!-- Brand Header -->
              <tr>
                <td style="padding: 32px 28px 20px 28px; text-align: center;">
                  <div style="display: inline-block; padding: 5px 14px; border-radius: 9999px; background-color: rgba(99, 102, 241, 0.12); color: #818cf8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; border: 1px solid rgba(99, 102, 241, 0.3);">
                    &#127891; Academic Enrollment Approved
                  </div>
                  <h1 class="header-title" style="color: #ffffff; margin: 0 0 8px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                    Enrollment Approved! &#127881;
                  </h1>
                  <p style="color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.5;">
                    You are now an officially enrolled student in <strong style="color: #a5b4fc;">${safeClassroom}</strong>.
                  </p>
                </td>
              </tr>

              <!-- Account Details Card -->
              <tr>
                <td style="padding: 0 24px 24px 24px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #172033; border: 1px solid #283548; border-radius: 14px; padding: 20px 20px;">
                    <tr>
                      <td style="border-bottom: 1px solid #283548; padding-bottom: 12px; margin-bottom: 12px;">
                        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">
                          &#128100; Your Account Details
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 12px;">
                        <table class="cred-table" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                          <!-- Student Name -->
                          <tr>
                            <td class="cred-label" valign="top" style="padding: 7px 0; color: #94a3b8; font-size: 12px; font-weight: 600; width: 130px;">
                              Student Name:
                            </td>
                            <td class="cred-val" valign="top" style="padding: 7px 0; color: #f8fafc; font-size: 13px; font-weight: 700; word-break: break-word; overflow-wrap: anywhere;">
                              ${safeName}
                            </td>
                          </tr>
                          <!-- Roll No / USN -->
                          <tr>
                            <td class="cred-label" valign="top" style="padding: 7px 0; color: #94a3b8; font-size: 12px; font-weight: 600;">
                              Roll No / USN:
                            </td>
                            <td class="cred-val" valign="top" style="padding: 7px 0; word-break: break-word; overflow-wrap: anywhere;">
                              <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; background-color: rgba(99, 102, 241, 0.18); border: 1px solid rgba(99, 102, 241, 0.4); color: #a5b4fc; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 13px; font-weight: 700;">
                                ${safeRollNo}
                              </span>
                            </td>
                          </tr>
                          <!-- Login Email -->
                          <tr>
                            <td class="cred-label" valign="top" style="padding: 7px 0; color: #94a3b8; font-size: 12px; font-weight: 600;">
                              Login Email:
                            </td>
                            <td class="cred-val" valign="top" style="padding: 7px 0; color: #cbd5e1; font-size: 13px; font-weight: 600; word-break: break-all; overflow-wrap: anywhere;">
                              ${safeEmail}
                            </td>
                          </tr>
                          <!-- Classroom Code -->
                          <tr>
                            <td class="cred-label" valign="top" style="padding: 7px 0; color: #94a3b8; font-size: 12px; font-weight: 600;">
                              Classroom Code:
                            </td>
                            <td class="cred-val" valign="top" style="padding: 7px 0; word-break: break-word; overflow-wrap: anywhere;">
                              <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 13px; font-weight: 800; letter-spacing: 0.5px;">
                                ${safeCode}
                              </span>
                            </td>
                          </tr>
                          <!-- Account Password -->
                          <tr>
                            <td class="cred-label" valign="top" style="padding: 7px 0; color: #94a3b8; font-size: 12px; font-weight: 600;">
                              Access Password:
                            </td>
                            <td class="cred-val" valign="top" style="padding: 7px 0; word-break: break-word; overflow-wrap: anywhere;">
                              ${isHash ? `
                                <div style="display: inline-block; padding: 3px 9px; border-radius: 6px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 12px; font-weight: 700;">
                                  &#10003; Password set during enrollment
                                </div>
                                <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; line-height: 1.4;">
                                  Use the personal password you entered when submitting your request.
                                </div>
                              ` : `
                                <span style="display: inline-block; padding: 3px 9px; border-radius: 6px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 13px; font-weight: 700; word-break: break-all; overflow-wrap: anywhere;">
                                  ${safePassword}
                                </span>
                              `}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Quick Login Instruction Box -->
              <tr>
                <td style="padding: 0 24px 24px 24px;">
                  <div style="background-color: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 12px; padding: 14px 16px; text-align: left;">
                    <p style="color: #c7d2fe; font-size: 12px; margin: 0; line-height: 1.5;">
                      &#128161; <strong>How to Sign In:</strong> Open the classroom portal, enter your <strong>Roll Number</strong> (<span style="color: #ffffff; font-family: monospace;">${safeRollNo}</span>) or <strong>Email</strong>, and enter your password.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Action Button -->
              <tr>
                <td style="padding: 0 24px 28px 24px; text-align: center;">
                  <a href="${appUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; padding: 13px 24px; text-align: center; border-radius: 12px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; letter-spacing: 0.3px; box-shadow: 0 4px 16px rgba(79, 70, 229, 0.35);">
                    Launch Classroom Portal &rarr;
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 0 28px 28px 28px; text-align: center; border-top: 1px solid #1e293b; padding-top: 20px;">
                  <p style="color: #64748b; font-size: 11px; margin: 0 0 6px 0; line-height: 1.5;">
                    Approved by Class Representative: <strong style="color: #94a3b8;">${safeAdmin}</strong>
                  </p>
                  <p style="color: #475569; font-size: 10px; margin: 0; line-height: 1.5;">
                    This automated notification was dispatched by iClassmates Academic Hub.<br />
                    &copy; ${new Date().getFullYear()} iClassmates. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return dispatchEmail({ to, subject, text, html });
};

