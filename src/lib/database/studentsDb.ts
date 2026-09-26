import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { User } from '@/types';
import { hashPassword } from '@/lib/security/passwordUtils';
import { sanitizePostgrestFilter, sanitizeEmail, sanitizeRollNumber } from '@/lib/security/querySanitizer';

/**
 * STUDENTS DATABASE OPERATIONS
 */

export interface StudentCredentialMeta {
  password?: string;
  phone?: string;
  mustChangePassword?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  isTeacher?: boolean;
  designation?: string;
  userBio?: string;
  nickname?: string;
  avatar?: string;
}

export const parseStudentRow = (d: any): User => {
  let meta: StudentCredentialMeta = {};
  let isJsonBio = false;
  if (d.bio && typeof d.bio === 'string' && d.bio.startsWith('{') && d.bio.endsWith('}')) {
    try {
      meta = JSON.parse(d.bio);
      isJsonBio = true;
    } catch {
      // not JSON
    }
  }

  const isAdmin = d.role === 'admin';

  return {
    id: d.id,
    name: d.name,
    nickname: meta.nickname !== undefined ? meta.nickname : (d.nickname || undefined),
    rollNo: d.roll_no,
    email: d.email || '',
    phone: d.phone || meta.phone || '',
    password: d.password || meta.password || '',
    mustChangePassword: d.must_change_password !== undefined ? !!d.must_change_password : !!meta.mustChangePassword,
    showPhone: isAdmin
      ? true
      : d.show_phone !== undefined && d.show_phone !== null
      ? !!d.show_phone
      : meta.showPhone !== undefined
      ? !!meta.showPhone
      : true,
    showEmail: isAdmin
      ? true
      : d.show_email !== undefined && d.show_email !== null
      ? !!d.show_email
      : meta.showEmail !== undefined
      ? !!meta.showEmail
      : true,
    role: d.role,
    isTeacher: false,
    designation: d.designation || meta.designation || (isAdmin ? 'Class Representative (CR)' : 'Classmate'),
    avatar: d.avatar || meta.avatar || '',
    status: d.status,
    joinedAt: d.joined_at,
    bio: meta.userBio !== undefined ? meta.userBio : (isJsonBio ? '' : (d.bio || '')),
    classroomId: d.classroom_id || undefined,
  };
};

export const dbFetchStudents = async (classroomId: string): Promise<User[] | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: true });

    if (error || !data) return null;
    // Strip passwords from the shared classroom student roster
    return data.map((d) => {
      const parsed = parseStudentRow(d);
      return { ...parsed, password: '' };
    });
  } catch (err) {
    console.warn('Error fetching students from Supabase:', err);
    return null;
  }
};

export const dbCreateStudent = async (student: User, classroomId: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    // Cryptographically hash password with PBKDF2 if not already hashed
    const hashedPassword = student.password
      ? (student.password.startsWith('pbkdf2:') ? student.password : await hashPassword(student.password))
      : undefined;

    const payload: Record<string, unknown> = {
      id: student.id,
      classroom_id: classroomId,
      name: student.name,
      roll_no: student.rollNo,
      email: student.email,
      role: student.role,
      avatar: student.avatar,
      status: student.status,
      joined_at: student.joinedAt,
      bio: student.bio || '',
    };
    if (student.phone !== undefined) payload.phone = student.phone;
    if (hashedPassword !== undefined) payload.password = hashedPassword;
    if (student.mustChangePassword !== undefined) payload.must_change_password = student.mustChangePassword;
    if (student.showPhone !== undefined) payload.show_phone = student.showPhone;
    if (student.showEmail !== undefined) payload.show_email = student.showEmail;
    if (student.isTeacher !== undefined) payload.is_teacher = student.isTeacher;
    if (student.designation !== undefined) payload.designation = student.designation;

    let res = await supabase.from('students').insert(payload);
    if (res.error) {
      delete payload.phone;
      delete payload.password;
      delete payload.must_change_password;
      delete payload.show_phone;
      delete payload.show_email;
      delete payload.is_teacher;
      delete payload.designation;

      const meta: StudentCredentialMeta = {
        password: hashedPassword,
        phone: student.phone,
        mustChangePassword: student.mustChangePassword,
        showPhone: student.showPhone,
        showEmail: student.showEmail,
        isTeacher: student.isTeacher,
        designation: student.designation,
        userBio: student.bio || '',
        nickname: student.nickname,
      };
      payload.bio = JSON.stringify(meta);
      res = await supabase.from('students').insert(payload);
    }

    return !res.error;
  } catch (err) {
    console.warn('Error creating student in Supabase:', err);
    return false;
  }
};

/**
 * Strict DTO filter to prevent Mass Assignment / Over-Posting attacks during student self-service profile updates.
 * Strips role, rollNo, id, joinedAt, and other protected fields.
 */
export function sanitizeStudentProfileUpdate(updates: Partial<User>): Partial<User> {
  const allowed: Partial<User> = {};
  if (updates.name !== undefined) allowed.name = String(updates.name).trim();
  if (updates.nickname !== undefined) allowed.nickname = String(updates.nickname).trim();
  if (updates.bio !== undefined) allowed.bio = String(updates.bio).trim();
  if (updates.avatar !== undefined) allowed.avatar = String(updates.avatar).trim();
  if (updates.status !== undefined) allowed.status = updates.status;
  if (updates.showPhone !== undefined) allowed.showPhone = Boolean(updates.showPhone);
  if (updates.showEmail !== undefined) allowed.showEmail = Boolean(updates.showEmail);
  if (updates.phone !== undefined) allowed.phone = String(updates.phone).trim();
  if (updates.password !== undefined) allowed.password = updates.password;
  if (updates.mustChangePassword !== undefined) allowed.mustChangePassword = Boolean(updates.mustChangePassword);
  return allowed;
}

export const dbUpdateStudent = async (
  studentId: string,
  rawUpdates: Partial<User>,
  classroomId?: string,
  isPrivilegedAdmin = false
): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  const updates = isPrivilegedAdmin ? rawUpdates : sanitizeStudentProfileUpdate(rawUpdates);

  try {
    // 1. Fetch current student record to preserve credentials and metadata
    const { data: current } = await supabase.from('students').select('*').eq('id', studentId).single();
    if (!current) {
      // If student not found (e.g. admin or missing record), create it if classroomId is provided
      if (classroomId && (updates.name || updates.avatar)) {
        const fallbackStudent: User = {
          id: studentId,
          name: updates.name || 'Class Representative',
          rollNo: updates.rollNo || 'CR-LEAD',
          email: updates.email || '',
          phone: updates.phone || '',
          role: updates.role || 'admin',
          avatar: updates.avatar || '',
          status: updates.status || 'online',
          joinedAt: new Date().toISOString().split('T')[0],
          bio: updates.bio || '',
          nickname: updates.nickname,
          showPhone: updates.showPhone !== false,
          showEmail: updates.showEmail !== false,
        };
        return await dbCreateStudent(fallbackStudent, classroomId);
      }
      return false;
    }

    const existing = parseStudentRow(current);

    // Hash password if updating with plaintext
    const hashedPassword = updates.password
      ? (updates.password.startsWith('pbkdf2:') ? updates.password : await hashPassword(updates.password))
      : existing.password;

    const meta: StudentCredentialMeta = {
      password: hashedPassword,
      phone: updates.phone !== undefined ? updates.phone : existing.phone,
      mustChangePassword: updates.mustChangePassword !== undefined ? updates.mustChangePassword : existing.mustChangePassword,
      showPhone: updates.showPhone !== undefined ? updates.showPhone : existing.showPhone,
      showEmail: updates.showEmail !== undefined ? updates.showEmail : existing.showEmail,
      isTeacher: updates.isTeacher !== undefined ? updates.isTeacher : existing.isTeacher,
      designation: updates.designation !== undefined ? updates.designation : existing.designation,
      userBio: updates.bio !== undefined ? updates.bio : (existing.bio || ''),
      nickname: updates.nickname !== undefined ? updates.nickname : existing.nickname,
      avatar: updates.avatar !== undefined ? updates.avatar : existing.avatar,
    };

    const payload: Record<string, unknown> = {
      bio: JSON.stringify(meta),
    };

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.rollNo !== undefined) payload.roll_no = updates.rollNo;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.avatar !== undefined) payload.avatar = updates.avatar;
    if (updates.status !== undefined) payload.status = updates.status;

    // Optional direct columns if migrated
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (hashedPassword !== undefined) payload.password = hashedPassword;
    if (updates.mustChangePassword !== undefined) payload.must_change_password = updates.mustChangePassword;
    if (updates.showPhone !== undefined) payload.show_phone = updates.showPhone;
    if (updates.showEmail !== undefined) payload.show_email = updates.showEmail;

    let res = await supabase.from('students').update(payload).eq('id', studentId);

    if (res.error && res.error.code === 'PGRST204') {
      delete payload.phone;
      delete payload.password;
      delete payload.must_change_password;
      delete payload.show_phone;
      delete payload.show_email;
      res = await supabase.from('students').update(payload).eq('id', studentId);
    }

    return !res.error;
  } catch (err) {
    console.warn('Error updating student in Supabase:', err);
    return false;
  }
};

export const dbDeleteStudent = async (studentId: string, classroomId?: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    let query = supabase.from('students').delete().eq('id', studentId);
    if (classroomId) {
      query = query.eq('classroom_id', classroomId);
    }
    const { error } = await query;
    return !error;
  } catch (err) {
    console.warn('Error deleting student in Supabase:', err);
    return false;
  }
};

export const dbLookupStudentByIdentifier = async (
  identifier: string,
  classroomId?: string
): Promise<{ student: User; classroomId: string } | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const clean = identifier.trim();
    const cleanDigits = clean.replace(/\D/g, '');

    let query = supabase.from('students').select('*');

    if (classroomId) {
      query = query.eq('classroom_id', sanitizePostgrestFilter(classroomId));
    }

    if (clean.includes('@')) {
      const cleanEmail = sanitizeEmail(clean);
      if (cleanEmail) {
        query = query.ilike('email', cleanEmail);
      }
    } else {
      const cleanRoll = sanitizeRollNumber(clean);
      const cleanGeneric = sanitizePostgrestFilter(clean);
      if (cleanRoll || cleanGeneric) {
        query = query.or(`roll_no.ilike.${cleanRoll || cleanGeneric},email.ilike.${cleanGeneric}`);
      }
    }

    const { data, error } = await query.limit(5);

    if (!error && data && data.length > 0) {
      return { student: parseStudentRow(data[0]), classroomId: data[0].classroom_id };
    }

    if (cleanDigits.length >= 7) {
      let phoneQuery = supabase.from('students').select('*');
      if (classroomId) {
        phoneQuery = phoneQuery.eq('classroom_id', classroomId);
      }
      const { data: allStuds } = await phoneQuery.limit(50);
      if (allStuds) {
        for (const row of allStuds) {
          const parsed = parseStudentRow(row);
          if (parsed.phone && parsed.phone.replace(/\D/g, '') === cleanDigits) {
            return { student: parsed, classroomId: row.classroom_id };
          }
        }
      }
    }

    // Fallback: If not found in the current classroomId, search across all classrooms
    if (classroomId) {
      const fallback = await dbLookupStudentByIdentifier(identifier);
      if (fallback) {
        return fallback;
      }
    }

    return null;
  } catch (err) {
    console.warn('Error looking up student in Supabase:', err);
    return null;
  }
};

export const dbBulkCreateStudents = async (students: User[], classroomId: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase || students.length === 0) return true;

  try {
    const payloads = await Promise.all(
      students.map(async (student) => {
        const hashedPassword = student.password
          ? (student.password.startsWith('pbkdf2:') ? student.password : await hashPassword(student.password))
          : undefined;

        const meta: StudentCredentialMeta = {
          password: hashedPassword,
          phone: student.phone,
          mustChangePassword: student.mustChangePassword,
          showPhone: student.showPhone,
          showEmail: student.showEmail,
          isTeacher: student.isTeacher,
          designation: student.designation,
          userBio: student.bio || '',
          nickname: student.nickname,
        };
        return {
          id: student.id,
          classroom_id: classroomId,
          name: student.name,
          roll_no: student.rollNo,
          email: student.email,
          role: student.role,
          avatar: student.avatar,
          status: student.status,
          joined_at: student.joinedAt,
          bio: JSON.stringify(meta),
        };
      })
    );

    const { error } = await supabase.from('students').insert(payloads);
    if (error) {
      console.warn('Error bulk inserting students in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception during bulk student creation:', err);
    return false;
  }
};
