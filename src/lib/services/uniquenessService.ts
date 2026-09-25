import { User, Classroom, PendingRequest } from '@/types';

export interface UniquenessCheckParams {
  email?: string;
  phone?: string;
  rollNo?: string;
  classroomId?: string;
  excludeUserId?: string;
}

export interface UniquenessCheckResult {
  available: boolean;
  field?: 'email' | 'phone' | 'rollNo';
  message?: string;
}

/**
 * Normalizes phone numbers to pure digits for strict collision detection.
 */
export function normalizePhoneDigits(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Normalizes email address to lowercased trimmed string.
 */
export function normalizeEmail(email?: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Compares two phone numbers to see if they represent the same line,
 * matching full digits or the core 10 digits (handling country code prefixes like +91 or 0).
 */
export function matchPhoneDigits(phoneA?: string, phoneB?: string): boolean {
  if (!phoneA || !phoneB) return false;
  const a = normalizePhoneDigits(phoneA);
  const b = normalizePhoneDigits(phoneB);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 10 && b.length >= 10) {
    return a.slice(-10) === b.slice(-10);
  }
  return false;
}

/**
 * Validates uniqueness locally in memory against the active classroom roster,
 * pending join requests, and the classroom administrator.
 */
export function validateUniquenessLocally({
  email,
  phone,
  rollNo,
  existingStudents = [],
  pendingRequests = [],
  classroom,
  excludeUserId,
}: {
  email?: string;
  phone?: string;
  rollNo?: string;
  existingStudents?: User[];
  pendingRequests?: PendingRequest[];
  classroom?: Partial<Classroom> | null;
  excludeUserId?: string;
}): UniquenessCheckResult {
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhoneDigits(phone);
  const cleanRoll = rollNo ? rollNo.trim().toUpperCase() : '';

  // 1. Check Email Uniqueness
  if (cleanEmail) {
    // Check against classroom administrator
    if (classroom?.adminEmail && normalizeEmail(classroom.adminEmail) === cleanEmail && classroom.adminId !== excludeUserId) {
      return {
        available: false,
        field: 'email',
        message: `The email "${cleanEmail}" is already registered to the Classroom Administrator. Each email can only be used once.`,
      };
    }

    // Check against active student roster
    const emailStudentMatch = existingStudents.find(
      (st) => st.id !== excludeUserId && normalizeEmail(st.email) === cleanEmail
    );
    if (emailStudentMatch) {
      return {
        available: false,
        field: 'email',
        message: `The email "${cleanEmail}" is already registered. Each email address can only be used once.`,
      };
    }

    // Check against pending approval requests
    const emailPendingMatch = pendingRequests.find(
      (req) => req.id !== excludeUserId && normalizeEmail(req.email) === cleanEmail
    );
    if (emailPendingMatch) {
      return {
        available: false,
        field: 'email',
        message: `An enrollment request with email "${cleanEmail}" is already pending approval.`,
      };
    }
  }

  // 2. Check Phone Number Uniqueness
  if (cleanPhone && cleanPhone.length >= 7) {
    // Check against classroom administrator
    if (classroom?.adminPhone && matchPhoneDigits(classroom.adminPhone, cleanPhone) && classroom.adminId !== excludeUserId) {
      return {
        available: false,
        field: 'phone',
        message: `This mobile/WhatsApp number is already registered to the Classroom Administrator. Each phone number can only be used once.`,
      };
    }

    // Check against active student roster
    const phoneStudentMatch = existingStudents.find(
      (st) => st.id !== excludeUserId && st.phone && matchPhoneDigits(st.phone, cleanPhone)
    );
    if (phoneStudentMatch) {
      return {
        available: false,
        field: 'phone',
        message: `This mobile/WhatsApp number is already registered. Each phone number can only be used once.`,
      };
    }

    // Check against pending approval requests
    const phonePendingMatch = pendingRequests.find(
      (req) => req.id !== excludeUserId && req.phone && matchPhoneDigits(req.phone, cleanPhone)
    );
    if (phonePendingMatch) {
      return {
        available: false,
        field: 'phone',
        message: `An enrollment request with this mobile number is already pending approval.`,
      };
    }
  }

  // 3. Check Roll Number Uniqueness
  if (cleanRoll) {
    const rollStudentMatch = existingStudents.find(
      (st) => st.id !== excludeUserId && st.rollNo.toUpperCase() === cleanRoll
    );
    if (rollStudentMatch) {
      return {
        available: false,
        field: 'rollNo',
        message: `Roll Number "${cleanRoll}" is already registered. Please sign in instead.`,
      };
    }
  }

  return { available: true };
}

/**
 * Checks uniqueness against the server database (/api/auth/check-unique).
 * Falls back to local validation if offline or server is unavailable.
 */
export async function checkServerUniqueness(params: UniquenessCheckParams): Promise<UniquenessCheckResult> {
  try {
    const res = await fetch('/api/auth/check-unique', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.field) {
        return {
          available: false,
          field: data.field,
          message: data.message || 'This identifier is already in use.',
        };
      }
      return { available: true };
    }

    const data = await res.json();
    return {
      available: !!data.available,
      field: data.field,
      message: data.message,
    };
  } catch (err) {
    console.warn('Network error checking server uniqueness, falling back to local validation:', err);
    return { available: true };
  }
}
