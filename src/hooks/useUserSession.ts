import { useState, useEffect } from 'react';
import { User, Classroom } from '@/types';
import { verifyPassword } from '@/lib/security/passwordUtils';
import { signUserSession } from '@/lib/security/sessionSecurity';

export function useUserSession(classroom: Classroom, students: User[], isDataLoaded?: boolean) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const [prefilledCode, setPrefilledCode] = useState('');

  // Restore session from localStorage & check ?code= or ?reset= URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);

      // Support complete reset to first-time visitor mode via URL query parameter
      if (params.get('reset') === 'true' || params.get('fresh') === 'true' || params.get('logout') === 'true') {
        localStorage.removeItem('classmate_current_user');
        localStorage.removeItem('classmate_session_token');
        localStorage.removeItem('classmate_classroom');
        sessionStorage.clear();
        setCurrentUser(null);
        setIsSessionLoaded(true);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      const codeParam = params.get('code');
      if (codeParam) {
        setPrefilledCode(codeParam.toUpperCase());
      }

      const adminSessionStr = sessionStorage.getItem('classmate_admin_session');
      if (adminSessionStr) {
        try {
          const parsed = JSON.parse(adminSessionStr);
          if (parsed && parsed.id) {
            setCurrentUser(parsed);
            setIsSessionLoaded(true);
            return;
          }
        } catch (e) {
          console.error('Failed to parse admin session:', e);
          sessionStorage.removeItem('classmate_admin_session');
        }
      }

      const savedUserStr = localStorage.getItem('classmate_current_user');
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          if (parsed && parsed.id) {
            setCurrentUser(parsed);
          }
        } catch (e) {
          console.error('Failed to parse saved session:', e);
          localStorage.removeItem('classmate_current_user');
        }
      }
      setIsSessionLoaded(true);
    }
  }, [classroom?.adminId, classroom?.adminEmail]);

  const handleUserLoggedIn = async (user: User) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      const isAdmin =
        user.role === 'admin' ||
        (classroom?.adminId && user.id === classroom.adminId) ||
        (classroom?.adminEmail && user.email?.toLowerCase() === classroom.adminEmail.toLowerCase());

      const token = await signUserSession(user.id, isAdmin ? 'admin' : 'student', classroom?.id);

      // Unified, HMAC-protected session storage across tabs & reloads
      localStorage.setItem('classmate_current_user', JSON.stringify(user));
      localStorage.setItem('classmate_session_token', token);

      if (isAdmin) {
        sessionStorage.setItem('classmate_admin_session', JSON.stringify(user));
        sessionStorage.setItem('classmate_session_token', token);
      } else {
        sessionStorage.removeItem('classmate_admin_session');
        sessionStorage.removeItem('classmate_session_token');
      }
    }
  };

  const handleAdminLogin = async (adminPasswordInput: string): Promise<boolean> => {
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
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(classroom.adminName || 'cr_admin')}`,
        status: 'online',
        joinedAt: new Date().toISOString().split('T')[0],
        bio: classroom.adminDesignation || 'Class Representative (CR)',
      };
      await handleUserLoggedIn(resolvedAdmin);
      return true;
    }
    return false;
  };

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('classmate_current_user');
      localStorage.removeItem('classmate_session_token');
      localStorage.removeItem('classmate_classroom');
      sessionStorage.clear();
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

  // Anti-forgery & active session validation: auto-logout if student was deleted or if forged admin session
  useEffect(() => {
    if (!isSessionLoaded || !isDataLoaded || !currentUser) return;

    // If no classroom exists in database, sign out stale local session
    if (!classroom?.id) {
      handleSignOut();
      return;
    }

    if (students.length === 0) return;

    const isAdmin =
      currentUser.role === 'admin' ||
      currentUser.id === classroom.adminId;

    if (isAdmin) {
      // Validate that the admin user is legitimately linked to this classroom
      const legitimateAdmin =
        (classroom.adminId && currentUser.id === classroom.adminId) ||
        (classroom.adminEmail && currentUser.email?.toLowerCase() === classroom.adminEmail.toLowerCase()) ||
        students.some(
          (s) => s.id === currentUser.id && s.role === 'admin'
        );

      if (!legitimateAdmin) {
        console.warn('Session security: Admin user not matched to current classroom roster. Signing out...');
        handleSignOut();
      }
    } else {
      // Validate that the student exists in the classroom's roster
      const isEnrolled = students.some((s) => s.id === currentUser.id);
      if (!isEnrolled) {
        console.warn(`Student ${currentUser.name} (${currentUser.id}) not found in current classroom roster. Signing out...`);
        handleSignOut();
      }
    }
  }, [isSessionLoaded, isDataLoaded, currentUser, classroom.id, classroom.adminId, classroom.adminEmail, students]);

  return {
    currentUser,
    setCurrentUser,
    isSessionLoaded,
    prefilledCode,
    handleUserLoggedIn,
    handleAdminLogin,
    handleSignOut,
  };
}
