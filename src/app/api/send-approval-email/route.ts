import { NextResponse } from 'next/server';
import { sendStudentApprovalEmail, isEmailConfigured } from '@/lib/server/mailer';
import { authenticateRequest } from '@/lib/server/serverAuth';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const approvalRateLimits = new Map<string, RateLimitRecord>();

function checkRateLimit(ip: string, maxRequests = 20, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const record = approvalRateLimits.get(ip);
  if (!record || now > record.resetAt) {
    approvalRateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) return false;
  record.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    const auth = await authenticateRequest(req, 'admin');
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized: Admin privileges required.' },
        { status: auth.statusCode }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many email requests from this network. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { to, email, name, rollNo, password, classroomName, classroomCode, adminName } = body;

    const targetEmail = (to || email || '').trim().toLowerCase();

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid student email is required.' },
        { status: 400 }
      );
    }

    if (!classroomCode || !classroomName) {
      return NextResponse.json(
        { success: false, message: 'Classroom code and name are required.' },
        { status: 400 }
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Approval email simulated (configure SMTP in .env.local for production delivery).',
        devMode: true,
      });
    }

    const result = await sendStudentApprovalEmail({
      to: targetEmail,
      name: name || 'Student',
      rollNo: rollNo || 'N/A',
      email: targetEmail,
      password: password || '',
      classroomName: classroomName || 'Classmate',
      classroomCode: classroomCode || '',
      adminName: adminName || '',
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to dispatch email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Approval details sent to ${targetEmail}`,
    });
  } catch (err: any) {
    console.error('Error in send-approval-email API:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Server error while sending approval email' },
      { status: 500 }
    );
  }
}
