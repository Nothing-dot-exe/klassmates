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
    tls: { rejectUnauthorized: false },
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
 * Sends a 6-digit OTP verification email with numeric code.
 */
export const sendVerificationEmail = async ({ to, code }: SendMailOptions): Promise<MailResult> => {
  const safeCode = escapeHtml(code);
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #4f46e5; margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Classmate</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">Classroom Collaboration Hub</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px 20px; text-align: center; margin-bottom: 24px;">
        <p style="color: #334155; font-size: 14px; font-weight: 500; margin: 0 0 12px 0;">Your 6-digit verification code is:</p>
        <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #4338ca; background: #eef2ff; border: 1px solid #c7d2fe; padding: 14px 24px; border-radius: 10px; display: inline-block; font-family: 'Courier New', Courier, monospace;">
          ${safeCode}
        </div>
        <p style="color: #64748b; font-size: 12px; margin: 16px 0 0 0;">Valid for <strong>10 minutes</strong>. Never share this code with anyone.</p>
      </div>
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0; line-height: 1.5;">
        If you did not request this verification code, you can safely ignore this message.
      </p>
    </div>
  `;

  return dispatchEmail({
    to,
    subject: `Your Classmate verification code is ${safeCode}`,
    text: `Your Classmate 6-digit verification code is: ${safeCode}. Valid for 10 minutes.`,
    html,
  });
};

/**
 * Sends an enrollment approval email to the approved student with escaped HTML parameters.
 */
export const sendStudentApprovalEmail = async (opts: StudentApprovalEmailOptions): Promise<MailResult> => {
  const { to, name, rollNo, email, password, classroomName, classroomCode, adminName } = opts;
  const passDisplay = password || 'Registered Credentials';

  const safeName = escapeHtml(name);
  const safeRollNo = escapeHtml(rollNo);
  const safeEmail = escapeHtml(email);
  const safeClassroom = escapeHtml(classroomName);
  const safeCode = escapeHtml(classroomCode);
  const safeAdmin = escapeHtml(adminName || 'Class Representative');
  const safePassword = escapeHtml(passDisplay);

  const subject = `🎉 Enrollment Approved: Welcome to ${safeClassroom}!`;
  const text = `Hello ${name},\n\nYour request to join "${classroomName}" (Code: ${classroomCode}) has been approved!\n\nHere are your login details:\n- Student Name: ${name}\n- Roll Number: ${rollNo}\n- Email: ${email}\n- Classroom Code: ${classroomCode}\n\nYou can sign in using your Roll Number or Email along with your chosen password.\n\nClass Representative: ${adminName || 'Class Representative'}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 20px; background: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background: #eef2ff; color: #4f46e5; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
          Classmate Enrollment
        </div>
        <h2 style="color: #0f172a; margin: 0 0 6px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
          Enrollment Approved! 🎉
        </h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">
          You are now an officially enrolled student in <strong>${safeClassroom}</strong>.
        </p>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
        <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin: 0 0 14px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
          Your Account Details
        </h3>

        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 38%;">Student Name:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Roll No / USN:</td>
            <td style="padding: 6px 0; color: #4338ca; font-family: monospace; font-weight: 700; font-size: 14px;">${safeRollNo}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Login Email:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${safeEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Classroom Code:</td>
            <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-weight: 700;">${safeCode}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Initial Password:</td>
            <td style="padding: 6px 0; color: #059669; font-family: monospace; font-weight: 700; font-size: 14px;">
              <span style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 6px;">${safePassword}</span>
            </td>
          </tr>
        </table>
      </div>

      <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px; text-align: center;">
        <p style="color: #3730a3; font-size: 12px; margin: 0; font-weight: 500;">
          💡 You can log in using either your <strong>Roll Number</strong> or <strong>Email</strong> along with your password.
        </p>
      </div>

      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0; line-height: 1.5;">
        Class Representative: <strong>${safeAdmin}</strong><br/>
        This automated notification was dispatched by Classmate Collaboration Hub.
      </p>
    </div>
  `;

  return dispatchEmail({ to, subject, text, html });
};
