import { verifySessionTokenOnly, SessionSignature } from '@/lib/security/sessionSecurity';

export interface AuthVerificationResult {
  authorized: boolean;
  user?: SessionSignature;
  error?: string;
  statusCode: number;
}

/**
 * Validates bearer session token from request headers.
 */
export async function authenticateRequest(
  req: Request,
  requiredRole?: 'admin' | 'student',
  requiredClassroomId?: string
): Promise<AuthVerificationResult> {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      error: 'Missing or malformed Authorization header. Expected Bearer <token>.',
      statusCode: 401,
    };
  }

  const token = authHeader.substring(7).trim();
  const session = await verifySessionTokenOnly(token);

  if (!session) {
    return {
      authorized: false,
      error: 'Invalid, forged, or expired session token.',
      statusCode: 401,
    };
  }

  if (requiredRole && session.role !== requiredRole && session.role !== 'admin') {
    return {
      authorized: false,
      error: `Forbidden: Required role "${requiredRole}", but session has role "${session.role}".`,
      statusCode: 403,
    };
  }

  if (requiredRole === 'admin' && session.role !== 'admin') {
    return {
      authorized: false,
      error: 'Forbidden: Operation strictly requires administrator privileges.',
      statusCode: 403,
    };
  }

  if (requiredClassroomId && session.classroomId && session.classroomId !== requiredClassroomId) {
    return {
      authorized: false,
      error: 'Forbidden: Session token is not authorized for this classroom.',
      statusCode: 403,
    };
  }

  return {
    authorized: true,
    user: session,
    statusCode: 200,
  };
}
