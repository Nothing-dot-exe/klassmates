import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Classroom, User } from '@/types';
import { dbCreateStudent } from './studentsDb';
import { hashPassword } from '@/lib/security/passwordUtils';

/**
 * CLASSROOM DATABASE OPERATIONS
 */

export interface ClassroomMeta {
  adminPassword?: string;
  adminName?: string;
  adminPhone?: string;
  adminEmail?: string;
  adminDesignation?: string;
  adminAvatar?: string;
  institutionName?: string;
}

export const parseClassroomRow = (d: any): Classroom => {
  let meta: ClassroomMeta = {};
  if (d.institution && typeof d.institution === 'string' && d.institution.startsWith('{') && d.institution.endsWith('}')) {
    try {
      meta = JSON.parse(d.institution);
    } catch {
      // not JSON
    }
  }

  return {
    id: d.id,
    name: d.name,
    code: d.code,
    section: d.section,
    semester: d.semester,
    institution: meta.institutionName || d.institution,
    adminId: d.admin_id,
    adminName: d.admin_name || meta.adminName || '',
    adminPhone: d.admin_phone || meta.adminPhone || '',
    adminEmail: d.admin_email || meta.adminEmail || '',
    adminPassword: d.admin_password || meta.adminPassword || '',
    adminDesignation: d.admin_designation || meta.adminDesignation || 'Class Representative (CR)',
    adminAvatar: d.admin_avatar || meta.adminAvatar || '',
    autoDeleteSetting: d.auto_delete_setting || 'off',
    requireApproval: d.require_approval ?? true,
    membersCount: d.members_count || 1,
  };
};

const enrichClassroomWithAdmin = async (cls: Classroom): Promise<Classroom> => {
  if (!isSupabaseConfigured() || !supabase) return cls;

  if (!cls.adminName || !cls.adminPhone || !cls.adminEmail) {
    try {
      const { data: adminRows } = await supabase
        .from('students')
        .select('*')
        .eq('classroom_id', cls.id)
        .or(`id.eq.${cls.adminId},role.eq.admin`)
        .limit(1);

      if (adminRows && adminRows.length > 0) {
        const a = adminRows[0];
        let meta: Record<string, any> = {};
        if (a.bio && typeof a.bio === 'string' && a.bio.startsWith('{')) {
          try {
            meta = JSON.parse(a.bio);
          } catch {
            // quiet
          }
        }
        return {
          ...cls,
          adminName: cls.adminName || a.name || 'Class Representative',
          adminPhone: cls.adminPhone || a.phone || meta.phone || '',
          adminEmail: cls.adminEmail || a.email || '',
          adminDesignation: cls.adminDesignation || a.designation || meta.designation || 'Class Representative (CR)',
        };
      }
    } catch {
      // quiet
    }
  }

  return {
    ...cls,
    adminName: cls.adminName || 'Class Representative',
  };
};

export const dbFetchLatestClassroom = async (): Promise<Classroom | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return await enrichClassroomWithAdmin(parseClassroomRow(data));
  } catch (err) {
    console.warn('Error fetching latest classroom from Supabase:', err);
    return null;
  }
};

export const dbFetchClassroom = async (classroomId: string): Promise<Classroom | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', classroomId)
      .single();

    if (error || !data) return null;
    return await enrichClassroomWithAdmin(parseClassroomRow(data));
  } catch (err) {
    console.warn('Error fetching classroom from Supabase:', err);
    return null;
  }
};

export const dbFetchClassroomByCode = async (code: string): Promise<Classroom | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .ilike('code', code.trim())
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return await enrichClassroomWithAdmin(parseClassroomRow(data));
  } catch (err) {
    console.warn('Error fetching classroom by code from Supabase:', err);
    return null;
  }
};

export const dbCreateClassroom = async (classroom: Classroom, admin: User): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return true;

  try {
    const rawAdminPassword = admin.password || classroom.adminPassword || '';
    const hashedAdminPassword = rawAdminPassword
      ? (rawAdminPassword.startsWith('pbkdf2:') ? rawAdminPassword : await hashPassword(rawAdminPassword))
      : '';

    const classroomPayload: Record<string, unknown> = {
      id: classroom.id,
      name: classroom.name,
      code: classroom.code,
      section: classroom.section,
      semester: classroom.semester,
      institution: classroom.institution,
      admin_id: admin.id,
      admin_name: admin.name,
      admin_phone: admin.phone || '',
      admin_email: admin.email || '',
      admin_password: hashedAdminPassword,
      admin_designation: classroom.adminDesignation || admin.designation || '',
      auto_delete_setting: classroom.autoDeleteSetting || 'off',
      require_approval: classroom.requireApproval ?? true,
      members_count: 1,
    };

    let res = await supabase.from('classrooms').upsert(classroomPayload);
    if (res.error && res.error.code === 'PGRST204') {
      delete classroomPayload.admin_name;
      delete classroomPayload.admin_phone;
      delete classroomPayload.admin_email;
      delete classroomPayload.admin_password;
      delete classroomPayload.admin_designation;

      const meta: ClassroomMeta = {
        adminPassword: hashedAdminPassword,
        adminName: admin.name,
        adminPhone: admin.phone || '',
        adminEmail: admin.email || '',
        adminDesignation: classroom.adminDesignation || admin.designation || '',
        institutionName: classroom.institution,
      };
      classroomPayload.institution = JSON.stringify(meta);
      res = await supabase.from('classrooms').upsert(classroomPayload);
    }

    if (res.error) {
      console.error('Failed to create/upsert classroom in Supabase:', res.error);
      return false;
    }

    if (admin.id !== 'usr_admin') {
      await supabase.from('students').delete().eq('id', 'usr_admin').eq('classroom_id', classroom.id);
    }

    const adminStudentToCreate = { ...admin, password: hashedAdminPassword };
    await dbCreateStudent(adminStudentToCreate, classroom.id);
    return true;
  } catch (err) {
    console.error('Error creating classroom in Supabase:', err);
    return false;
  }
};

export const dbResetClassroomData = async (classroomId: string, adminId?: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return true;

  try {
    await supabase.from('messages').delete().eq('classroom_id', classroomId);
    await supabase.from('documents').delete().eq('classroom_id', classroomId);
    await supabase.from('pending_requests').delete().eq('classroom_id', classroomId);
    try {
      await supabase.from('password_reset_requests').delete().eq('classroom_id', classroomId);
    } catch {
      // optional table
    }
    await supabase.from('students').delete().eq('classroom_id', classroomId);

    if (adminId) {
      await supabase.from('students').delete().eq('id', adminId).eq('classroom_id', classroomId);
    }
    await supabase.from('students').delete().eq('id', 'usr_admin').eq('classroom_id', classroomId);

    await supabase.from('classrooms').delete().eq('id', classroomId);
    return true;
  } catch (err) {
    console.warn('Error resetting classroom in Supabase:', err);
    return false;
  }
};

export const dbUpdateClassroom = async (classroomId: string, updates: Partial<Classroom>): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.code !== undefined) payload.code = updates.code;
    if (updates.section !== undefined) payload.section = updates.section;
    if (updates.semester !== undefined) payload.semester = updates.semester;
    if (updates.institution !== undefined) payload.institution = updates.institution;
    if (updates.adminId !== undefined) payload.admin_id = updates.adminId;
    if (updates.adminName !== undefined) payload.admin_name = updates.adminName;
    if (updates.adminPhone !== undefined) payload.admin_phone = updates.adminPhone;
    if (updates.adminEmail !== undefined) payload.admin_email = updates.adminEmail;
    if (updates.adminAvatar !== undefined) payload.admin_avatar = updates.adminAvatar;
    if (updates.adminPassword !== undefined) {
      payload.admin_password = updates.adminPassword.startsWith('pbkdf2:')
        ? updates.adminPassword
        : await hashPassword(updates.adminPassword);
    }
    if (updates.autoDeleteSetting !== undefined) payload.auto_delete_setting = updates.autoDeleteSetting;
    if (updates.requireApproval !== undefined) payload.require_approval = updates.requireApproval;
    if (updates.membersCount !== undefined) payload.members_count = updates.membersCount;

    let res = await supabase.from('classrooms').update(payload).eq('id', classroomId);
    if (res.error && res.error.code === 'PGRST204') {
      delete payload.admin_name;
      delete payload.admin_phone;
      delete payload.admin_email;
      delete payload.admin_avatar;
      delete payload.admin_password;

      try {
        const { data: currentRoom } = await supabase.from('classrooms').select('institution').eq('id', classroomId).single();
        let meta: ClassroomMeta = {};
        if (currentRoom?.institution && typeof currentRoom.institution === 'string' && currentRoom.institution.startsWith('{')) {
          try { meta = JSON.parse(currentRoom.institution); } catch {}
        }
        if (updates.adminName !== undefined) meta.adminName = updates.adminName;
        if (updates.adminPhone !== undefined) meta.adminPhone = updates.adminPhone;
        if (updates.adminEmail !== undefined) meta.adminEmail = updates.adminEmail;
        if (updates.adminAvatar !== undefined) meta.adminAvatar = updates.adminAvatar;
        if (updates.adminDesignation !== undefined) meta.adminDesignation = updates.adminDesignation;
        payload.institution = JSON.stringify(meta);
      } catch {}

      res = await supabase.from('classrooms').update(payload).eq('id', classroomId);
    }

    return !res.error;
  } catch (err) {
    console.warn('Error updating classroom in Supabase:', err);
    return false;
  }
};
