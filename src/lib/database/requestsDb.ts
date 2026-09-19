import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { PendingRequest, PasswordResetRequest } from '@/types';
import { dbUpdateStudent } from './studentsDb';
import { hashPassword } from '@/lib/security/passwordUtils';

/**
 * PENDING AND PASSWORD RESET REQUESTS DATABASE OPERATIONS
 */

export const dbFetchPendingRequests = async (classroomId: string): Promise<PendingRequest[] | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('pending_requests')
      .select('*')
      .eq('classroom_id', classroomId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((r) => {
      let email = r.email || '';
      let phone = r.phone || '';
      let password = r.password || '';

      if (email.startsWith('{') && email.endsWith('}')) {
        try {
          const parsed = JSON.parse(email);
          if (parsed.email) email = parsed.email;
          if (parsed.phone && !phone) phone = parsed.phone;
          if (parsed.password && !password) password = parsed.password;
        } catch {
          // ignore
        }
      }

      return {
        id: r.id,
        name: r.name,
        rollNo: r.roll_no,
        email,
        phone,
        password,
        showPhone: !!r.show_phone,
        showEmail: !!r.show_email,
        requestedAt: r.requested_at,
        status: r.status,
      };
    });
  } catch (err) {
    console.warn('Error fetching pending requests from Supabase:', err);
    return null;
  }
};

export const dbCreatePendingRequest = async (req: PendingRequest, classroomId: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const rawPassword = req.password || '';
    const hashedPassword = rawPassword
      ? (rawPassword.startsWith('pbkdf2:') ? rawPassword : await hashPassword(rawPassword))
      : '';

    const payload: Record<string, unknown> = {
      id: req.id,
      classroom_id: classroomId,
      name: req.name,
      roll_no: req.rollNo,
      email: req.email,
      requested_at: req.requestedAt,
      status: 'pending',
    };
    if (req.phone !== undefined) payload.phone = req.phone;
    if (hashedPassword) payload.password = hashedPassword;
    if (req.showPhone !== undefined) payload.show_phone = req.showPhone;
    if (req.showEmail !== undefined) payload.show_email = req.showEmail;

    let res = await supabase.from('pending_requests').insert(payload);
    if (res.error) {
      const packedEmail = JSON.stringify({
        email: req.email,
        phone: req.phone || '',
        password: hashedPassword || '',
      });
      const corePayload = {
        id: req.id,
        classroom_id: classroomId,
        name: req.name,
        roll_no: req.rollNo,
        email: packedEmail,
        requested_at: req.requestedAt,
        status: 'pending',
      };
      res = await supabase.from('pending_requests').insert(corePayload);
    }

    return !res.error;
  } catch (err) {
    console.warn('Error creating pending request in Supabase:', err);
    return false;
  }
};

export const dbDeletePendingRequest = async (reqId: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const { error } = await supabase.from('pending_requests').delete().eq('id', reqId);
    return !error;
  } catch (err) {
    console.warn('Error deleting pending request in Supabase:', err);
    return false;
  }
};

export const dbFetchPasswordResetRequests = async (classroomId: string): Promise<PasswordResetRequest[] | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('password_reset_requests')
      .select('*')
      .eq('classroom_id', classroomId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((r) => ({
      id: r.id,
      classroomId: r.classroom_id,
      studentId: r.student_id,
      studentName: r.student_name,
      rollNo: r.roll_no,
      phone: r.phone || '',
      email: r.email || '',
      note: r.note || '',
      requestedAt: r.requested_at,
      status: r.status,
    }));
  } catch {
    return null;
  }
};

export const dbCreatePasswordResetRequest = async (req: PasswordResetRequest): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const { error } = await supabase.from('password_reset_requests').insert({
      id: req.id,
      classroom_id: req.classroomId,
      student_id: req.studentId,
      student_name: req.studentName,
      roll_no: req.rollNo,
      phone: req.phone || '',
      email: req.email || '',
      note: req.note || '',
      requested_at: req.requestedAt,
      status: 'pending',
    });

    return !error;
  } catch (err) {
    console.warn('Error creating password reset request in Supabase:', err);
    return false;
  }
};

export const dbDeletePasswordResetRequest = async (reqId: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const { error } = await supabase.from('password_reset_requests').delete().eq('id', reqId);
    return !error;
  } catch (err) {
    console.warn('Error deleting password reset request in Supabase:', err);
    return false;
  }
};

export const dbResolvePasswordResetRequest = async (reqId: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const { error } = await supabase
      .from('password_reset_requests')
      .update({ status: 'approved' })
      .eq('id', reqId);
    return !error;
  } catch (err) {
    console.warn('Error resolving password reset request in Supabase:', err);
    return false;
  }
};

export const dbUpdateStudentPassword = async (
  studentId: string,
  newPassword: string,
  mustChangePassword = false
): Promise<boolean> => {
  return await dbUpdateStudent(studentId, {
    password: newPassword,
    mustChangePassword,
  });
};
