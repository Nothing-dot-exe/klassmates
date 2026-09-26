import React from 'react';
import { Classroom, User, PendingRequest, PasswordResetRequest, DocumentItem, ChatMessage } from '@/types';
import { EMPTY_CLASSROOM } from '@/lib/mockData';
import { DEFAULT_TEMP_PASSWORD } from '@/lib/privacyUtils';
import {
  dbUpdateClassroom, dbCreateStudent, dbBulkCreateStudents, dbUpdateStudent, dbDeleteStudent,
  dbDeletePendingRequest, dbCreatePasswordResetRequest, dbResolvePasswordResetRequest,
  dbDeletePasswordResetRequest, dbUpdateStudentPassword, dbCreateClassroom, dbResetClassroomData,
  dbSendMessage,
} from '@/lib/databaseService';
import { broadcastStudentRemoved, broadcastRoomReset, broadcastRequestDeclined, broadcastNewMessage, broadcastStudentUpdated } from '@/lib/realtimeService';
import { apiSendApprovalEmail } from '@/lib/emailService';

interface UseAdminActionsParams {
  classroom: Classroom;
  setClassroom: React.Dispatch<React.SetStateAction<Classroom>>;
  students: User[];
  setStudents: React.Dispatch<React.SetStateAction<User[]>>;
  pendingRequests: PendingRequest[];
  setPendingRequests: React.Dispatch<React.SetStateAction<PendingRequest[]>>;
  setPasswordResetRequests: React.Dispatch<React.SetStateAction<PasswordResetRequest[]>>;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>;
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  onUserLoggedIn: (u: User) => void;
}

const persistUserSession = (user: User, adminId?: string) => {
  if (typeof window === 'undefined') return;
  const isAdmin = user.role === 'admin' || (adminId && user.id === adminId);
  localStorage.setItem('classmate_current_user', JSON.stringify(user));
  sessionStorage.setItem('classmate_current_user', JSON.stringify(user));
  if (isAdmin) {
    sessionStorage.setItem('classmate_admin_session', JSON.stringify(user));
  }
};

export function useAdminActions({
  classroom, setClassroom, students, setStudents,
  pendingRequests, setPendingRequests, setPasswordResetRequests,
  setDocuments, setMessages, currentUser, setCurrentUser, onUserLoggedIn,
}: UseAdminActionsParams) {
  const isAuthorizedAdmin = (): boolean => {
    if (!currentUser) return false;
    return (
      currentUser.role === 'admin' ||
      (Boolean(classroom.adminId) && currentUser.id === classroom.adminId) ||
      (Boolean(classroom.adminEmail) && currentUser.email?.toLowerCase() === classroom.adminEmail?.toLowerCase())
    );
  };

  const handleAddStudent = (student: User) => {
    if (!isAuthorizedAdmin()) {
      console.warn('Unauthorized attempt to add student');
      return;
    }
    setStudents((prev) => [...prev, student]);
    setClassroom((prev) => ({ ...prev, membersCount: prev.membersCount + 1 }));
    dbCreateStudent(student, classroom.id);
    dbUpdateClassroom(classroom.id, { membersCount: classroom.membersCount + 1 });
  };

  const handleBulkAddStudents = (newStudents: User[]) => {
    if (!isAuthorizedAdmin() || newStudents.length === 0) return;
    setStudents((prev) => [...prev, ...newStudents]);
    setClassroom((prev) => ({ ...prev, membersCount: prev.membersCount + newStudents.length }));
    dbBulkCreateStudents(newStudents, classroom.id);
    dbUpdateClassroom(classroom.id, { membersCount: classroom.membersCount + newStudents.length });
  };

  const handleRemoveStudent = (id: string) => {
    if (!isAuthorizedAdmin()) {
      console.warn('Unauthorized attempt to remove student');
      return;
    }
    broadcastStudentRemoved(id, classroom.id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setClassroom((prev) => ({ ...prev, membersCount: Math.max(1, prev.membersCount - 1) }));
    dbDeleteStudent(id, classroom.id);
    dbUpdateClassroom(classroom.id, { membersCount: Math.max(1, classroom.membersCount - 1) });
  };

  const mapRequestToStudent = (req: PendingRequest, id: string): User => ({
    id, name: req.name, rollNo: req.rollNo, phone: req.phone || '', email: req.email,
    password: req.password || DEFAULT_TEMP_PASSWORD, mustChangePassword: false,
    showPhone: req.showPhone ?? false, showEmail: req.showEmail ?? false, role: 'student',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${req.rollNo}`, status: 'online',
    joinedAt: new Date().toISOString().split('T')[0],
  });

  const handleApproveRequest = (id: string) => {
    if (!isAuthorizedAdmin()) {
      console.warn('Unauthorized attempt to approve request');
      return;
    }
    const req = pendingRequests.find((r) => r.id === id);
    if (req) {
      const newStudent = mapRequestToStudent(req, `usr_${Date.now()}`);
      setStudents((prev) => [...prev, newStudent]);
      setPendingRequests((prev) => prev.filter((r) => r.id !== id));
      setClassroom((prev) => ({ ...prev, membersCount: prev.membersCount + 1 }));

      dbCreateStudent(newStudent, classroom.id);
      dbDeletePendingRequest(id);
      dbUpdateClassroom(classroom.id, { membersCount: classroom.membersCount + 1 });

      if (req.email) {
        const rawPwd = newStudent.password || '';
        const isHash = !rawPwd || rawPwd.startsWith('pbkdf2:') || rawPwd.startsWith('$2') || rawPwd.length > 35;
        const plainPass = isHash ? undefined : rawPwd;
        apiSendApprovalEmail({
          to: req.email, name: newStudent.name, rollNo: newStudent.rollNo,
          email: req.email, password: plainPass,
          classroomName: classroom.name, classroomCode: classroom.code,
        });
      }
    }
  };

  const handleUpdateStudent = (studentId: string, updated: Partial<User>) => {
    if (!isAuthorizedAdmin() && (!currentUser || currentUser.id !== studentId)) {
      console.warn('Unauthorized attempt to update student');
      return;
    }
    const sanitizedUpdated = isAuthorizedAdmin() ? updated : { ...updated };
    if (!isAuthorizedAdmin()) {
      delete sanitizedUpdated.role;
      delete sanitizedUpdated.password;
      delete sanitizedUpdated.id;
    }

    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, ...sanitizedUpdated } : s)));
    if (currentUser && currentUser.id === studentId) {
      const merged = { ...currentUser, ...sanitizedUpdated };
      setCurrentUser(merged);
      persistUserSession(merged, classroom.adminId);
    }
    dbUpdateStudent(studentId, sanitizedUpdated);
  };

  const handleApproveAllRequests = () => {
    if (!isAuthorizedAdmin()) {
      console.warn('Unauthorized attempt to bulk approve requests');
      return;
    }
    const newStudents: User[] = pendingRequests.map((req, idx) =>
      mapRequestToStudent(req, `usr_${Date.now()}_${idx}`)
    );
    setStudents((prev) => [...prev, ...newStudents]);
    setClassroom((prev) => ({ ...prev, membersCount: prev.membersCount + newStudents.length }));
    setPendingRequests([]);

    newStudents.forEach((st) => dbCreateStudent(st, classroom.id));
    pendingRequests.forEach((req, idx) => {
      dbDeletePendingRequest(req.id);
      if (req.email) {
        const st = newStudents[idx];
        const rawPwd = st?.password || '';
        const isHash = !rawPwd || rawPwd.startsWith('pbkdf2:') || rawPwd.startsWith('$2') || rawPwd.length > 35;
        const plainPass = isHash ? undefined : rawPwd;
        apiSendApprovalEmail({
          to: req.email, name: req.name, rollNo: req.rollNo, email: req.email,
          password: plainPass,
          classroomName: classroom.name, classroomCode: classroom.code,
        });
      }
    });
    dbUpdateClassroom(classroom.id, { membersCount: classroom.membersCount + newStudents.length });
  };

  const handleRejectRequest = (id: string) => {
    if (!isAuthorizedAdmin()) {
      console.warn('Unauthorized attempt to reject request');
      return;
    }
    const req = pendingRequests.find((r) => r.id === id);
    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    dbDeletePendingRequest(id);
    if (req) {
      broadcastRequestDeclined(req.id, req.rollNo, classroom.id);
    }
  };

  const handleUpdateClassroom = (updated: Partial<Classroom>) => {
    if (!isAuthorizedAdmin()) {
      console.warn('Unauthorized attempt to update classroom settings');
      return;
    }
    setClassroom((prev) => ({ ...prev, ...updated }));
    dbUpdateClassroom(classroom.id, updated);
    if (updated.adminPassword) {
      const adminStudent = students.find((s) => s.role === 'admin' || s.id === classroom.adminId);
      if (adminStudent) {
        dbUpdateStudent(adminStudent.id, { password: updated.adminPassword, mustChangePassword: false });
        setStudents((prev) =>
          prev.map((s) =>
            s.id === adminStudent.id ? { ...s, password: updated.adminPassword, mustChangePassword: false } : s
          )
        );
      }
      if (currentUser && (currentUser.role === 'admin' || currentUser.id === classroom.adminId)) {
        const updatedCurrentUser = { ...currentUser, password: updated.adminPassword, mustChangePassword: false };
        setCurrentUser(updatedCurrentUser);
        persistUserSession(updatedCurrentUser, classroom.adminId);
      }
    }
  };

  const handleRequestPasswordReset = (
    req: PasswordResetRequest | Omit<PasswordResetRequest, 'id' | 'createdAt' | 'status'>
  ) => {
    const fullReq: PasswordResetRequest = {
      ...req,
      id: 'id' in req && req.id ? req.id : `pwreq_${Date.now()}`,
      classroomId: classroom.id,
      requestedAt: 'Just now',
      status: 'pending',
    };
    setPasswordResetRequests((prev) => [fullReq, ...prev.filter((r) => r.id !== fullReq.id)]);
    dbCreatePasswordResetRequest(fullReq);
  };

  const handleApprovePasswordReset = async (requestId: string, studentId: string) => {
    if (!isAuthorizedAdmin()) {
      console.warn('Unauthorized attempt to approve password reset');
      return;
    }
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, password: DEFAULT_TEMP_PASSWORD, mustChangePassword: true } : s
      )
    );
    setPasswordResetRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
    );
    await dbUpdateStudentPassword(studentId, DEFAULT_TEMP_PASSWORD, true);
    await dbResolvePasswordResetRequest(requestId);
  };

  const handleRejectPasswordReset = async (requestId: string) => {
    if (!isAuthorizedAdmin()) {
      console.warn('Unauthorized attempt to reject password reset');
      return;
    }
    setPasswordResetRequests((prev) => prev.filter((r) => r.id !== requestId));
    await dbDeletePasswordResetRequest(requestId);
  };

  const handleAdminResetPassword = async (studentId: string, tempPassword = DEFAULT_TEMP_PASSWORD) => {
    if (!isAuthorizedAdmin()) {
      console.warn('Unauthorized attempt to reset student password');
      return;
    }
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, password: tempPassword, mustChangePassword: true } : s
      )
    );
    await dbUpdateStudentPassword(studentId, tempPassword, true);
  };

  const handleUpdateStudentPassword = async (studentId: string, newPassword: string): Promise<boolean> => {
    try {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, password: newPassword, mustChangePassword: false } : s))
      );
      if (currentUser && currentUser.id === studentId) {
        const updatedUser: User = { ...currentUser, password: newPassword, mustChangePassword: false };
        setCurrentUser(updatedUser);
        persistUserSession(updatedUser, classroom.adminId);
      }
      await dbUpdateStudentPassword(studentId, newPassword, false);
      return true;
    } catch (e) {
      console.error('Failed to update student password:', e);
      return false;
    }
  };

  const handleUpdateCurrentUser = (updated: Partial<User>) => {
    if (!currentUser) return;
    const merged: User = { ...currentUser, ...updated };
    setCurrentUser(merged);
    persistUserSession(merged, classroom.adminId);
    
    // Update students list state
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === currentUser.id);
      if (exists) {
        return prev.map((s) => (s.id === currentUser.id ? { ...s, ...updated } : s));
      }
      return [...prev, merged];
    });

    // Update avatar and name across loaded chat messages so user's messages immediately reflect new avatar
    if (updated.avatar || updated.name) {
      setMessages((prev) => {
        const next: Record<string, ChatMessage[]> = {};
        let changed = false;
        Object.entries(prev).forEach(([channelKey, list]) => {
          next[channelKey] = list.map((m) => {
            if (m.senderId === currentUser.id) {
              changed = true;
              return {
                ...m,
                senderAvatar: updated.avatar || m.senderAvatar,
                senderName: updated.name || m.senderName,
              };
            }
            return m;
          });
        });
        return changed ? next : prev;
      });
    }

    // If currentUser is Admin, update classroom state and database record
    if (currentUser.id === classroom.adminId || currentUser.role === 'admin') {
      setClassroom((prev) => ({
        ...prev,
        adminName: merged.name || prev.adminName,
        adminPhone: merged.phone || prev.adminPhone,
        adminEmail: merged.email || prev.adminEmail,
        adminAvatar: merged.avatar || prev.adminAvatar,
      }));
      dbUpdateClassroom(classroom.id, {
        adminName: merged.name,
        adminPhone: merged.phone,
        adminEmail: merged.email,
        adminAvatar: merged.avatar,
      });
    }

    // Persist to Supabase students table
    dbUpdateStudent(currentUser.id, updated, classroom.id);

    // Broadcast realtime student update to all connected classmates
    broadcastStudentUpdated(merged, classroom.id);
  };

  const handleRegisterTeacher = (teacher: User) => {
    setStudents([teacher]);
    setClassroom((prev) => ({
      ...prev,
      adminName: teacher.name,
      adminPhone: teacher.phone,
      adminEmail: teacher.email,
      adminPassword: teacher.password || prev.adminPassword,
      adminId: teacher.id,
    }));
    dbCreateStudent(teacher, classroom.id);
    dbUpdateClassroom(classroom.id, {
      adminName: teacher.name,
      adminPhone: teacher.phone,
      adminEmail: teacher.email,
      adminPassword: teacher.password,
      adminId: teacher.id,
    });
    dbDeleteStudent('usr_admin', classroom.id);
    onUserLoggedIn(teacher);
  };

  const handleCreateClassroom = async (newClassroom: Classroom, admin: User) => {
    setClassroom(newClassroom);
    setStudents([admin]);
    setMessages({ chn_general: [] });
    setDocuments([]);
    setPendingRequests([]);
    setPasswordResetRequests([]);

    dbCreateClassroom(newClassroom, admin);
    dbDeleteStudent('usr_admin', newClassroom.id);
    onUserLoggedIn(admin);
  };

  const handleResetRoomData = async () => {
    if (!isAuthorizedAdmin()) {
      console.warn('Unauthorized attempt to reset classroom database');
      return;
    }
    if (classroom.id) {
      broadcastRoomReset(classroom.id);
    }
    try {
      await dbResetClassroomData(classroom.id, classroom.adminId);
    } catch (e) {
      console.warn('Error resetting classroom database:', e);
    }

    setClassroom(EMPTY_CLASSROOM);
    setStudents([]);
    setMessages({ chn_general: [] });
    setDocuments([]);
    setPendingRequests([]);
    setPasswordResetRequests([]);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('classmate_current_user');
      localStorage.removeItem('classmate_classroom');
      sessionStorage.clear();
      window.location.href = '/?fresh=true';
    }

    setCurrentUser(null);
  };

  const handleLeaveClassroom = async (userToLeave?: User | null, successorId?: string): Promise<boolean> => {
    const target = userToLeave || currentUser;
    if (!target) return false;

    if (userToLeave && userToLeave.id !== currentUser?.id && !isAuthorizedAdmin()) {
      console.warn('Unauthorized attempt to force another user to leave');
      return false;
    }

    const isAdmin =
      target.role === 'admin' ||
      target.id === classroom.adminId;

    const remainingStudents = students.filter((s) => s.id !== target.id);

    // If Admin is leaving and there are classmates left in the room: successor is REQUIRED!
    if (isAdmin && remainingStudents.length > 0) {
      if (!successorId) {
        console.warn('Cannot leave classroom as admin without selecting a successor.');
        return false;
      }

      const successor = remainingStudents.find((s) => s.id === successorId);
      if (!successor) {
        console.warn('Selected successor not found in student roster.');
        return false;
      }

      // 1. Promote successor to Admin in DB
      const promotedSuccessor: User = {
        ...successor,
        role: 'admin',
        isTeacher: false,
        designation: 'Class Representative & Admin',
      };

      await dbUpdateStudent(successor.id, {
        role: 'admin',
        isTeacher: false,
        designation: 'Class Representative & Admin',
      });

      // 2. Transfer Classroom Ownership in DB & State
      const updatedClassroom: Classroom = {
        ...classroom,
        adminId: successor.id,
        adminName: successor.name,
        adminEmail: successor.email,
        adminPhone: successor.phone,
        adminDesignation: 'Class Representative & Admin',
        membersCount: Math.max(1, classroom.membersCount - 1),
      };

      await dbUpdateClassroom(classroom.id, {
        adminId: successor.id,
        adminName: successor.name,
        adminEmail: successor.email,
        adminPhone: successor.phone,
        adminDesignation: 'Class Representative & Admin',
        membersCount: Math.max(1, classroom.membersCount - 1),
      });

      setClassroom(updatedClassroom);

      // 3. Post Announcement of Admin Departure & Succession in #general
      const studentName = target.nickname?.trim() || target.name;
      const announcementMessage: ChatMessage = {
        id: `msg_succession_${Date.now()}`,
        channelId: 'chn_general',
        senderId: 'sys_classroom',
        senderName: 'Classroom Notice',
        senderRollNo: 'SYSTEM',
        senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ClassroomSuccession',
        content: `👋 **${studentName}** has stepped down and left the classroom.\n\n👑 **${successor.name}** (\`${successor.rollNo}\`) has been appointed as the new **Class Representative & Admin**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: false,
        autoDelete: 'off',
        reactions: [
          { emoji: '👑', count: 1, users: ['sys_classroom'] },
          { emoji: '👏', count: 1, users: ['sys_classroom'] },
        ],
      };

      setMessages((prev) => ({
        ...prev,
        chn_general: [...(prev.chn_general || []), announcementMessage],
      }));
      broadcastNewMessage(announcementMessage, classroom.id);
      dbSendMessage(announcementMessage, classroom.id);

      // 4. Remove departing student from class roster
      broadcastStudentRemoved(target.id, classroom.id);
      setStudents((prev) =>
        prev
          .filter((s) => s.id !== target.id)
          .map((s) => (s.id === successor.id ? promotedSuccessor : s))
      );
      await dbDeleteStudent(target.id, classroom.id);

      // 5. Clear credentials & sign out
      if (typeof window !== 'undefined') {
        localStorage.removeItem('classmate_current_user');
        sessionStorage.removeItem('classmate_admin_session');
        localStorage.removeItem('classmate_session_token');
        sessionStorage.removeItem('classmate_session_token');
      }
      setCurrentUser(null);
      return true;
    }

    // Regular student leaving (or lone member)
    const studentName = target.nickname?.trim() || target.name;
    const farewellMessage: ChatMessage = {
      id: `msg_farewell_${Date.now()}`,
      channelId: 'chn_general',
      senderId: 'sys_classroom',
      senderName: 'Classroom Notice',
      senderRollNo: 'SYSTEM',
      senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ClassroomNotice',
      content: `👋 **${studentName}** has left the classroom.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEncrypted: false,
      autoDelete: 'off',
      reactions: [],
    };

    // 1. Immediately post announcement to local state for general channel
    setMessages((prev) => ({
      ...prev,
      chn_general: [...(prev.chn_general || []), farewellMessage],
    }));

    // 2. Realtime WebSocket broadcast & DB persistence so all active classmates see it
    broadcastNewMessage(farewellMessage, classroom.id);
    dbSendMessage(farewellMessage, classroom.id);

    // 3. Remove student from class roster and update membersCount
    broadcastStudentRemoved(target.id, classroom.id);
    setStudents((prev) => prev.filter((s) => s.id !== target.id));
    setClassroom((prev) => ({ ...prev, membersCount: Math.max(1, prev.membersCount - 1) }));
    await dbDeleteStudent(target.id, classroom.id);
    await dbUpdateClassroom(classroom.id, { membersCount: Math.max(1, classroom.membersCount - 1) });

    // 4. Clear credentials and sign out
    if (typeof window !== 'undefined') {
      localStorage.removeItem('classmate_current_user');
      sessionStorage.removeItem('classmate_admin_session');
      localStorage.removeItem('classmate_session_token');
      sessionStorage.removeItem('classmate_session_token');
    }
    setCurrentUser(null);
    return true;
  };

  return {
    isAuthorizedAdmin,
    handleAddStudent, handleBulkAddStudents, handleRemoveStudent, handleApproveRequest,
    handleUpdateStudent, handleApproveAllRequests, handleRejectRequest, handleUpdateClassroom,
    handleRequestPasswordReset, handleApprovePasswordReset, handleRejectPasswordReset,
    handleAdminResetPassword, handleUpdateStudentPassword, handleUpdateCurrentUser,
    handleRegisterTeacher, handleCreateClassroom, handleResetRoomData, handleLeaveClassroom,
  };
}
