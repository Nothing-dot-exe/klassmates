import { useState, useEffect } from 'react';
import { User, Classroom } from '@/types';
import { verifyPassword } from '@/lib/security/passwordUtils';
import { signUserSession } from '@/lib/security/sessionSecurity';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true' || params.get('fresh') === 'true' || params.get('logout') === 'true') {
      try {
        localStorage.removeItem('classmate_current_user');
        localStorage.removeItem('classmate_session_token');
        localStorage.removeItem('classmate_classroom');
        localStorage.removeItem('classmate_classroom_id');
        sessionStorage.clear();
      } catch {}
      return null;
    }

    const savedClassroomId = localStorage.getItem('classmate_classroom_id') || undefined;

    const adminSessionStr = sessionStorage.getItem('classmate_admin_session');
    if (adminSessionStr) {
      const parsed = JSON.parse(adminSessionStr);
      if (parsed && parsed.id) {
        if (!parsed.classroomId && savedClassroomId) parsed.classroomId = savedClassroomId;
        return parsed;
      }
    }
    const tabUserStr = sessionStorage.getItem('classmate_current_user');
    if (tabUserStr) {
      const parsed = JSON.parse(tabUserStr);
      if (parsed && parsed.id) {
        if (!parsed.classroomId && savedClassroomId) parsed.classroomId = savedClassroomId;
        return parsed;
      }
    }
    const savedUserStr = localStorage.getItem('classmate_current_user');
    if (savedUserStr) {
      const parsed = JSON.parse(savedUserStr);
      if (parsed && parsed.id) {
        if (!parsed.classroomId && savedClassroomId) parsed.classroomId = savedClassroomId;
        return parsed;
      }
    }
  } catch {}
  return null;
}

function getInitialCode(): string {
  if (typeof window === 'undefined') return '';
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('code')?.toUpperCase() || '';
  } catch {
    return '';
  }
}

export function useUserSession(classroom: Classroom, students: User[], isDataLoaded?: boolean) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const [prefilledCode, setPrefilledCode] = useState<string>('');

  // Hydrate session and query parameters cleanly on client mount
  useEffect(() => {
    try {
      const user = getInitialUser();
      if (user) {
        setCurrentUser(user);
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code')?.toUpperCase() || '';
      if (code) {
        setPrefilledCode(code);
      }

      if (params.get('reset') === 'true' || params.get('fresh') === 'true' || params.get('logout') === 'true') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {}

    setIsSessionLoaded(true);
  }, []);

  const handleUserLoggedIn = async (user: User, rememberMe: boolean = true) => {
    const effectiveClassroomId = user.classroomId || classroom?.id;
    const userToSave: User = {
      ...user,
      classroomId: effectiveClassroomId,
    };
    setCurrentUser(userToSave);

    if (typeof window !== 'undefined') {
      try {
        if (effectiveClassroomId) {
          localStorage.setItem('classmate_classroom_id', effectiveClassroomId);
        }

        const isAdmin =
          userToSave.role === 'admin' ||
          (classroom?.adminId && userToSave.id === classroom.adminId) ||
          (classroom?.adminEmail && userToSave.email?.toLowerCase() === classroom.adminEmail.toLowerCase());

        let token = '';
        try {
          token = await signUserSession(userToSave.id, isAdmin ? 'admin' : 'student', effectiveClassroomId);
        } catch (sigErr) {
          console.warn('Could not generate cryptographic session token:', sigErr);
          token = `fallback_token_${userToSave.id}_${Date.now()}`;
        }

        if (rememberMe) {
          // Persistent storage for personal laptop/mobile
          try {
            localStorage.setItem('classmate_current_user', JSON.stringify(userToSave));
            localStorage.setItem('classmate_session_token', token);
            sessionStorage.removeItem('classmate_current_user');
          } catch {}
        } else {
          // Ephemeral session storage for shared campus lab computers (clears when browser tab closes)
          try {
            localStorage.removeItem('classmate_current_user');
            localStorage.removeItem('classmate_session_token');
            sessionStorage.setItem('classmate_current_user', JSON.stringify(userToSave));
            sessionStorage.setItem('classmate_session_token', token);
          } catch {}
        }

        if (isAdmin) {
          try {
            sessionStorage.setItem('classmate_admin_session', JSON.stringify(userToSave));
            sessionStorage.setItem('classmate_session_token', token);
          } catch {}
        } else {
          try {
            sessionStorage.removeItem('classmate_admin_session');
          } catch {}
        }
      } catch (err) {
        console.warn('Could not persist session storage:', err);
      }
    }
  };

  const handleAdminLogin = async (adminPasswordInput: string, rememberMe: boolean = true): Promise<boolean> => {
    const input = adminPasswordInput.trim();
    if (!input) return false;

    const configuredAdminPassword = classroom.adminPassword?.trim();
    const adminUser = students.find((s) => s.role === 'admin' || s.id === classroom.adminId);

    let isMatch = false;
    if (configuredAdminPassword) {
      const check = await verifyPassword(input, configuredAdminPassword);
      if (check.isValid) isMatch = true;
    }
    if (!isMatch && adminUser?.password) {
      const check = await verifyPassword(input, adminUser.password);
      if (check.isValid) isMatch = true;
    }

    if (!isMatch && isSupabaseConfigured() && supabase) {
      try {
        const { data: allClassrooms } = await supabase.from('classrooms').select('*');
        if (allClassrooms) {
          for (const c of allClassrooms) {
            let admPw = c.admin_password;
            if (!admPw && c.institution && typeof c.institution === 'string' && c.institution.startsWith('{')) {
              try {
                admPw = JSON.parse(c.institution).adminPassword;
              } catch {}
            }
            if (admPw) {
              const check = await verifyPassword(input, admPw);
              if (check.isValid) {
                const resolvedAdmin: User = {
                  id: c.admin_id || 'usr_admin',
                  name: c.admin_name || 'Class Representative',
                  rollNo: 'CR-LEAD',
                  email: c.admin_email || '',
                  phone: c.admin_phone || '',
                  password: '',
                  showPhone: true,
                  showEmail: true,
                  role: 'admin',
                  isTeacher: false,
                  designation: 'Class Representative (CR)',
                  avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(c.admin_name || 'cr_admin')}`,
                  status: 'online',
                  joinedAt: new Date().toISOString().split('T')[0],
                  bio: 'Class Representative (CR)',
                  classroomId: c.id,
                };
                await handleUserLoggedIn(resolvedAdmin, rememberMe);
                return true;
              }
            }
          }
        }
      } catch {}
    }

    if (isMatch) {
      const resolvedAdmin: User = adminUser || {
        id: classroom.adminId || 'usr_admin',
        name: classroom.adminName || 'Class Representative',
        rollNo: 'CR-LEAD',
        email: classroom.adminEmail || '',
        phone: classroom.adminPhone || '',
        password: '',
        showPhone: true,
        showEmail: true,
        role: 'admin',
        isTeacher: false,
        designation: classroom.adminDesignation || 'Class Representative (CR)',
        avatar: classroom.adminAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(classroom.adminName || 'cr_admin')}`,
        status: 'online',
        joinedAt: new Date().toISOString().split('T')[0],
        bio: classroom.adminDesignation || 'Class Representative (CR)',
        classroomId: classroom.id,
      };
      await handleUserLoggedIn(resolvedAdmin, rememberMe);
      return true;
    }
    return false;
  };

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('classmate_current_user');
        localStorage.removeItem('classmate_session_token');
        localStorage.removeItem('classmate_classroom');
        localStorage.removeItem('classmate_classroom_id');
        sessionStorage.clear();
      } catch {}
    }
    setCurrentUser(null);
  };

  // Realtime instant kickout listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStudentRemoved = (e: Event) => {
      const customEvt = e as CustomEvent<{ studentId?: string }>;
      if (currentUser && customEvt.detail?.studentId === currentUser.id) {
        console.warn('Student removed event received for current user. Logging out...');
        handleSignOut();
        alert('You have been removed from this classroom by the instructor.');
      }
    };

    const handleRoomReset = () => {
      console.warn('Classroom reset event received. Logging out...');
      handleSignOut();
      alert('The classroom was reset by the instructor. Session ended.');
    };

    window.addEventListener('classmate:student_removed', handleStudentRemoved);
    window.addEventListener('classmate:room_reset', handleRoomReset);

    return () => {
      window.removeEventListener('classmate:student_removed', handleStudentRemoved);
      window.removeEventListener('classmate:room_reset', handleRoomReset);
    };
  }, [currentUser]);

  // Anti-forgery & active session validation: auto-logout only if student/admin was confirmed deleted from database
  useEffect(() => {
    if (!isSessionLoaded || !isDataLoaded || !currentUser) return;

    // Do NOT wipe session while classroom is hydrating or unset
    if (!classroom?.id) return;

    // Do NOT wipe session while roster is empty or loading
    if (students.length === 0) return;

    // Multi-classroom safety: if user belongs to another classroom that is currently syncing or switching, do not sign out!
    if (currentUser.classroomId && classroom.id && currentUser.classroomId !== classroom.id) {
      return;
    }

    const isAdmin =
      currentUser.role === 'admin' ||
      currentUser.id === classroom.adminId;

    if (isAdmin) {
      const legitimateAdmin =
        (classroom.adminId && currentUser.id === classroom.adminId) ||
        (classroom.adminEmail && currentUser.email?.toLowerCase() === classroom.adminEmail.toLowerCase()) ||
        students.some((s) => s.id === currentUser.id && s.role === 'admin');

      if (legitimateAdmin) return;
    } else {
      const isEnrolled = students.some((s) => s.id === currentUser.id);
      if (isEnrolled) return;
    }

    // If client array check fails, DO NOT instantly kick out the user!
    // Mobile sleep/resume cycles or network delays cause transient mismatches.
    // Verify asynchronously against Supabase before taking any action.
    let isCancelled = false;

    const verifyWithServer = async () => {
      try {
        if (!isSupabaseConfigured() || !supabase) return;

        // Check if student exists in database
        const { data: dbStudent } = await supabase
          .from('students')
          .select('id, classroom_id')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (isCancelled) return;

        if (dbStudent) {
          // Student is valid! If they belong to another classroom, update their session
          if (dbStudent.classroom_id && dbStudent.classroom_id !== currentUser.classroomId) {
            setCurrentUser((prev) => (prev ? { ...prev, classroomId: dbStudent.classroom_id } : null));
            try {
              localStorage.setItem('classmate_classroom_id', dbStudent.classroom_id);
            } catch {}
          }
          return;
        }

        // Check if admin exists in classroom record
        const { data: dbAdminCls } = await supabase
          .from('classrooms')
          .select('id, admin_id, admin_email')
          .or(`admin_id.eq.${currentUser.id},id.eq.${currentUser.classroomId || classroom.id}`)
          .maybeSingle();

        if (isCancelled) return;

        if (
          dbAdminCls &&
          (dbAdminCls.admin_id === currentUser.id ||
            (dbAdminCls.admin_email && dbAdminCls.admin_email.toLowerCase() === currentUser.email?.toLowerCase()))
        ) {
          return;
        }

        // User was truly removed from database
        console.warn(`Session validation: User ${currentUser.name} (${currentUser.id}) confirmed removed. Signing out...`);
        handleSignOut();
      } catch (err) {
        console.warn('Network error during session validation check; retaining session:', err);
      }
    };

    verifyWithServer();

    return () => {
      isCancelled = true;
    };
  }, [isSessionLoaded, isDataLoaded, currentUser, classroom.id, classroom.adminId, classroom.adminEmail, students]);

  return {
    currentUser,
    setCurrentUser,
    isSessionLoaded,
    setIsSessionLoaded,
    prefilledCode,
    handleUserLoggedIn,
    handleAdminLogin,
    handleSignOut,
  };
}
