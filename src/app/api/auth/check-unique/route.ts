import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeEmail, sanitizeRollNumber, sanitizePostgrestFilter } from '@/lib/security/querySanitizer';

// Rate limiting: max 60 uniqueness checks per 5 minutes per IP
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimits = new Map<string, RateLimitRecord>();

function checkRateLimit(ip: string, max = 60, windowMs = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimits.get(ip);
  if (!record || now > record.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= max) return false;
  record.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { available: true, message: 'Rate limit exceeded, skipping check.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body.email === 'string' ? body.email.trim() : '';
    const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const rawRoll = typeof body.rollNo === 'string' ? body.rollNo.trim() : '';
    const classroomId = typeof body.classroomId === 'string' ? body.classroomId.trim() : '';
    const excludeUserId = typeof body.excludeUserId === 'string' ? body.excludeUserId.trim() : '';

    const cleanEmail = sanitizeEmail(rawEmail);
    const cleanPhoneDigits = rawPhone.replace(/\D/g, '');
    const cleanRoll = sanitizeRollNumber(rawRoll);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Supabase is not configured; local validation handles it
      return NextResponse.json({ available: true });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Check Email Uniqueness
    if (cleanEmail) {
      // Check students table
      let studentQuery = supabase
        .from('students')
        .select('id, name, email')
        .ilike('email', cleanEmail)
        .limit(1);

      if (excludeUserId) {
        studentQuery = studentQuery.neq('id', sanitizePostgrestFilter(excludeUserId));
      }

      const { data: studentMatch } = await studentQuery;
      if (studentMatch && studentMatch.length > 0) {
        return NextResponse.json({
          available: false,
          field: 'email',
          message: `The email "${cleanEmail}" is already registered. Each email address can only be used once.`,
        });
      }

      // Check classrooms table for admin email
      let adminQuery = supabase
        .from('classrooms')
        .select('id, name, admin_email')
        .ilike('admin_email', cleanEmail)
        .limit(1);

      if (excludeUserId) {
        adminQuery = adminQuery.neq('admin_id', sanitizePostgrestFilter(excludeUserId));
      }

      const { data: adminMatch } = await adminQuery;
      if (adminMatch && adminMatch.length > 0) {
        return NextResponse.json({
          available: false,
          field: 'email',
          message: `The email "${cleanEmail}" is already registered as an administrator. Each email can only be used once.`,
        });
      }

      // Check pending_requests table
      let reqQuery = supabase
        .from('pending_requests')
        .select('id, email')
        .ilike('email', cleanEmail)
        .limit(1);

      if (classroomId) {
        reqQuery = reqQuery.eq('classroom_id', sanitizePostgrestFilter(classroomId));
      }

      const { data: reqMatch } = await reqQuery;
      if (reqMatch && reqMatch.length > 0) {
        return NextResponse.json({
          available: false,
          field: 'email',
          message: `An enrollment request with email "${cleanEmail}" is already pending approval.`,
        });
      }
    }

    // 2. Check Phone Uniqueness
    if (cleanPhoneDigits.length >= 7) {
      // Check students
      const { data: allStudents } = await supabase
        .from('students')
        .select('id, phone')
        .not('phone', 'is', null)
        .limit(100);

      if (allStudents) {
        const phoneMatch = allStudents.find(
          (s) => s.id !== excludeUserId && s.phone && s.phone.replace(/\D/g, '') === cleanPhoneDigits
        );
        if (phoneMatch) {
          return NextResponse.json({
            available: false,
            field: 'phone',
            message: `This mobile/WhatsApp number is already registered. Each phone number can only be used once.`,
          });
        }
      }

      // Check classrooms admin_phone
      const { data: allClassrooms } = await supabase
        .from('classrooms')
        .select('id, admin_id, admin_phone')
        .not('admin_phone', 'is', null)
        .limit(100);

      if (allClassrooms) {
        const adminPhoneMatch = allClassrooms.find(
          (c) => c.admin_id !== excludeUserId && c.admin_phone && c.admin_phone.replace(/\D/g, '') === cleanPhoneDigits
        );
        if (adminPhoneMatch) {
          return NextResponse.json({
            available: false,
            field: 'phone',
            message: `This mobile/WhatsApp number is already registered to a classroom administrator. Each phone number can only be used once.`,
          });
        }
      }

      // Check pending_requests phone
      let pendingPhoneQuery = supabase
        .from('pending_requests')
        .select('id, phone')
        .not('phone', 'is', null)
        .limit(50);

      if (classroomId) {
        pendingPhoneQuery = pendingPhoneQuery.eq('classroom_id', sanitizePostgrestFilter(classroomId));
      }

      const { data: pendingPhoneData } = await pendingPhoneQuery;
      if (pendingPhoneData) {
        const pendingMatch = pendingPhoneData.find(
          (r) => r.phone && r.phone.replace(/\D/g, '') === cleanPhoneDigits
        );
        if (pendingMatch) {
          return NextResponse.json({
            available: false,
            field: 'phone',
            message: `An enrollment request with this mobile number is already pending approval.`,
          });
        }
      }
    }

    // 3. Check Roll Number Uniqueness (if classroomId provided)
    if (cleanRoll && classroomId) {
      let rollQuery = supabase
        .from('students')
        .select('id, roll_no')
        .eq('classroom_id', sanitizePostgrestFilter(classroomId))
        .ilike('roll_no', cleanRoll)
        .limit(1);

      if (excludeUserId) {
        rollQuery = rollQuery.neq('id', sanitizePostgrestFilter(excludeUserId));
      }

      const { data: rollMatch } = await rollQuery;
      if (rollMatch && rollMatch.length > 0) {
        return NextResponse.json({
          available: false,
          field: 'rollNo',
          message: `Roll Number "${cleanRoll}" is already registered in this classroom.`,
        });
      }
    }

    return NextResponse.json({ available: true });
  } catch (err: any) {
    console.error('Error in /api/auth/check-unique route:', err);
    return NextResponse.json({ available: true });
  }
}
