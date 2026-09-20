import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/server/serverAuth';

export async function GET(req: Request) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { valid: false, message: auth.error || 'Session is invalid or expired.' },
        { status: auth.statusCode }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: auth.user.userId,
        role: auth.user.role,
        classroomId: auth.user.classroomId,
        issuedAt: auth.user.issuedAt,
      },
    });
  } catch (err) {
    console.error('Error verifying session:', err);
    return NextResponse.json(
      { valid: false, message: 'Server error during session verification.' },
      { status: 500 }
    );
  }
}
