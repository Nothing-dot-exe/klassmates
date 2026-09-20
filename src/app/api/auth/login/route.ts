import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPassword } from '@/lib/security/passwordUtils';
import { signUserSession } from '@/lib/security/sessionSecurity';
import { parseStudentRow } from '@/lib/database/studentsDb';
import { sanitizePostgrestFilter, sanitizeEmail, sanitizeRollNumber } from '@/lib/security/querySanitizer';

// In-memory rate limiting: 10 attempts per 5 minutes per IP
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const loginRateLimits = new Map<string, RateLimitRecord>();

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const record = loginRateLimits.get(ip);
  if (!record || now > record.resetAt) {
    loginRateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) return false;
  record.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many login attempts. Please wait a few minutes before retrying.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const identifier = (body.identifier || body.email || body.rollNo || '').trim();
    const password = (body.password || '').trim();
    const classroomId = (body.classroomId || '').trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Identifier (roll number or email) and password are required.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, message: 'Authentication service unavailable.' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query student by roll number or email with PostgREST filter injection protection
    let query = supabase.from('students').select('*');
    if (classroomId) {
      query = query.eq('classroom_id', sanitizePostgrestFilter(classroomId));
    }

    if (identifier.includes('@')) {
      const cleanEmail = sanitizeEmail(identifier);
      if (!cleanEmail) {
        return NextResponse.json(
          { success: false, message: 'Invalid email identifier format.' },
          { status: 400 }
        );
      }
      query = query.ilike('email', cleanEmail);
    } else {
      const cleanRoll = sanitizeRollNumber(identifier);
      const cleanGeneric = sanitizePostgrestFilter(identifier);
      if (!cleanRoll && !cleanGeneric) {
        return NextResponse.json(
          { success: false, message: 'Invalid identifier format.' },
          { status: 400 }
        );
      }
      query = query.or(`roll_no.ilike.${cleanRoll || cleanGeneric},email.ilike.${cleanGeneric}`);
    }

    const { data: students, error } = await query.limit(1);

    if (error || !students || students.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. No account matches this identifier.' },
        { status: 401 }
      );
    }

    const studentRow = students[0];
    let storedPassword = studentRow.password || '';

    // Check packed metadata in bio if column was empty
    if (!storedPassword && studentRow.bio && studentRow.bio.startsWith('{')) {
      try {
        const meta = JSON.parse(studentRow.bio);
        if (meta.password) storedPassword = meta.password;
      } catch {}
    }

    if (!storedPassword) {
      return NextResponse.json(
        { success: false, message: 'Account has no registered password. Please reset your password.' },
        { status: 401 }
      );
    }

    const { isValid } = await verifyPassword(password, storedPassword);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid password. Please verify your credentials.' },
        { status: 401 }
      );
    }

    // Generate signed session token
    const token = await signUserSession(studentRow.id, studentRow.role || 'student', studentRow.classroom_id);

    // Return sanitized student profile (passwords stripped)
    const sanitizedStudent = parseStudentRow(studentRow);
    sanitizedStudent.password = '';

    return NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: sanitizedStudent,
      token,
    });
  } catch (err: any) {
    console.error('Error in login API:', err);
    return NextResponse.json(
      { success: false, message: 'An internal error occurred during authentication.' },
      { status: 500 }
    );
  }
}
