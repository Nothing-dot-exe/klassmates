import React from 'react';
import { Classroom, User, PendingRequest, PasswordResetRequest } from '@/types';
import { dbLookupStudentByIdentifier, dbUpdateStudent } from '@/lib/databaseService';
import { DEFAULT_TEMP_PASSWORD } from '@/lib/privacyUtils';
import { verifyPassword } from '@/lib/security/passwordUtils';
import { generateUniqueId } from '@/lib/security/idUtils';
import { useJoinGateState } from './useJoinGateState';
import { useJoinGateOtp } from './useJoinGateOtp';

export interface JoinGateActionProps {
  classroom: Classroom;
  existingStudents: User[];
  onLoginStudent: (student: User, rememberMe?: boolean) => void;
  onLoginAdmin: (adminPasswordInput: string, rememberMe?: boolean) => boolean | Promise<boolean>;
  onCreateClassroom?: (classroom: Classroom, admin: User) => void;
  onJoinSubmitted: (req: PendingRequest, classroomId?: string) => void;
  onJoinDirect: (student: User) => void;
  onRequestPasswordReset: (req: PasswordResetRequest) => void;
  onUpdateStudentPassword: (studentId: string, newPassword: string) => Promise<boolean>;
}

export const useJoinGateActions = (
  s: ReturnType<typeof useJoinGateState>,
  otp: ReturnType<typeof useJoinGateOtp>,
  props: JoinGateActionProps
) => {
  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    s.setErrorMessage('');
    if (!s.newAdminName.trim()) return s.setErrorMessage('Please enter your full name as the Class Representative / Student Lead.');
    if (!s.newAdminPhone.trim()) return s.setErrorMessage('Please enter your mobile/WhatsApp number.');
    if (!s.newAdminEmail.trim()) return s.setErrorMessage('Please enter your student email address.');
    if (!otp.isAdminEmailVerified) return s.setErrorMessage('Please verify your email address using the 6-digit code before launching.');
    if (!s.newAdminRollNo.trim()) return s.setErrorMessage('Please enter your Student Roll Number / USN.');
    if (s.newAdminPassword.length < 6) return s.setErrorMessage('Master Admin Password must be at least 6 characters.');
    if (!s.newRoomName.trim()) return s.setErrorMessage('Please enter a name for your classroom.');

    const adminId = generateUniqueId('usr_admin');
    const cleanCode = (s.newRoomCode.trim() || 'CS-' + Math.floor(1000 + Math.random() * 9000)).toUpperCase();
    const rollNo = s.newAdminRollNo.trim().toUpperCase();
    const designation = s.creatorDesignation.trim() || 'Class Representative (CR)';
    const bio = 'Class Representative & Student Lead';

    const createdAdmin: User = {
      id: adminId,
      name: s.newAdminName.trim(),
      rollNo,
      phone: s.newAdminPhone.trim(),
      email: s.newAdminEmail.trim(),
      password: s.newAdminPassword,
      mustChangePassword: false,
      showPhone: true,
      showEmail: true,
      role: 'admin',
      isTeacher: false,
      designation,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(s.newAdminName.trim())}`,
      status: 'online',
      joinedAt: new Date().toISOString().split('T')[0],
      bio,
    };

    const createdClassroom: Classroom = {
      id: `cls_${Date.now()}`,
      name: s.newRoomName.trim(),
      code: cleanCode,
      section: s.newRoomSection.trim() || 'Section B',
      semester: s.newRoomSemester.trim() || 'Semester 6',
      institution: s.newRoomInstitution.trim() || 'Dept. of Computer Science & Engineering',
      adminId: adminId,
      adminName: createdAdmin.name,
      adminPhone: createdAdmin.phone,
      adminEmail: createdAdmin.email,
      adminPassword: s.newAdminPassword,
      adminDesignation: designation,
      autoDeleteSetting: 'off',
      requireApproval: true,
      membersCount: 1,
    };

    if (props.onCreateClassroom) props.onCreateClassroom(createdClassroom, createdAdmin);
    else props.onLoginStudent(createdAdmin);
  };

  const handleStudentJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    s.setErrorMessage('');
    const cleanCode = s.joinCode.trim().toUpperCase();
    const cleanRoll = s.studentRollNo.trim().toUpperCase();
    const cleanPhone = s.studentPhone.trim();
    const cleanEmail = s.studentEmail.trim();

    const targetClassroom = s.resolvedClassroom || (props.classroom.code ? props.classroom : null);
    if (!targetClassroom || cleanCode !== targetClassroom.code.toUpperCase()) {
      return s.setErrorMessage(`Invalid or unknown class code "${cleanCode}". Please verify with your Class Representative.`);
    }
    if (s.studentPassword.length < 6) return s.setErrorMessage('Please create a password of at least 6 characters.');
    if (!otp.isStudentEmailVerified) return s.setErrorMessage('Please verify your student email address with the 6-digit code before requesting to join.');

    const alreadyEnrolled = props.existingStudents.find((st) => st.rollNo.toUpperCase() === cleanRoll);
    if (alreadyEnrolled) {
      s.setErrorMessage(`Roll Number "${cleanRoll}" is already registered. Please use Sign In.`);
      s.setNavMode('signin');
      s.setSignInRole('student');
      s.setLoginIdentifier(cleanRoll);
      return;
    }

    if (!targetClassroom.requireApproval) {
      const newStudent: User = {
        id: generateUniqueId('usr'),
        name: s.studentName.trim(),
        rollNo: cleanRoll,
        phone: cleanPhone,
        email: cleanEmail || `${cleanRoll.toLowerCase()}@classmate.edu`,
        password: s.studentPassword,
        mustChangePassword: false,
        showPhone: false,
        showEmail: false,
        role: 'student',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanRoll}`,
        status: 'online',
        joinedAt: new Date().toISOString().split('T')[0],
        bio: 'Enrolled via Class Code',
      };
      props.onJoinDirect(newStudent);
      props.onLoginStudent(newStudent);
      return;
    }

    const newReq: PendingRequest = {
      id: generateUniqueId('req'),
      name: s.studentName.trim(),
      rollNo: cleanRoll,
      phone: cleanPhone,
      email: cleanEmail || `${cleanRoll.toLowerCase()}@student.edu`,
      password: s.studentPassword,
      showPhone: false,
      showEmail: false,
      requestedAt: 'Just now',
      status: 'pending',
    };
    props.onJoinSubmitted(newReq, targetClassroom?.id);
    s.setPendingRollNo(cleanRoll);
    s.setIsWaitingApproval(true);
  };

  const handleStudentLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    s.setErrorMessage('');
    const cleanId = s.loginIdentifier.trim();
    if (!cleanId) return s.setErrorMessage('Please enter your Roll Number, Email, or Mobile Number.');

    // Look up student from DB first to get password hash (roster strips passwords for privacy)
    let dbMatch = await dbLookupStudentByIdentifier(cleanId, props.classroom.id);
    let student = dbMatch?.student;

    if (!student) {
      student = props.existingStudents.find(
        (st) =>
          st.rollNo.toUpperCase() === cleanId.toUpperCase() ||
          st.email.toLowerCase() === cleanId.toLowerCase() ||
          (st.phone && st.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, ''))
      );
    }

    if (!student) return s.setErrorMessage(`No account found for "${cleanId}". Please register with your Class Code.`);

    const isAdminAccount =
      student.role === 'admin' ||
      student.id === props.classroom.adminId ||
      (!!props.classroom.adminEmail && student.email.toLowerCase() === props.classroom.adminEmail.toLowerCase());

    const inputPassword = s.loginPassword.trim();
    let isValid = false;
    let needsRehash = false;

    // 1. Check against DB stored password (hashed or plain)
    if (student.password) {
      const check = await verifyPassword(inputPassword, student.password);
      if (check.isValid) {
        isValid = true;
        needsRehash = check.needsRehash;
      }
    }

    // 2. Default student initial password: their roll number (e.g. MCA2024-002)
    if (!isValid && student.rollNo) {
      if (inputPassword.toUpperCase() === student.rollNo.toUpperCase()) {
        isValid = true;
      }
    }

    // 3. Check classroom master admin password if admin account
    if (!isValid && isAdminAccount && props.classroom.adminPassword) {
      const adminCheck = await verifyPassword(inputPassword, props.classroom.adminPassword);
      if (adminCheck.isValid) isValid = true;
    }

    // 4. Fallback default temp password
    if (!isValid) {
      const tempCheck = await verifyPassword(inputPassword, DEFAULT_TEMP_PASSWORD);
      if (tempCheck.isValid) isValid = true;
    }

    // 5. Admin default password fallback
    if (!isValid && isAdminAccount && (inputPassword === 'Admin@2026' || inputPassword === 'admin123')) {
      isValid = true;
    }

    if (!isValid) {
      return s.setErrorMessage('Incorrect password. Default password for students is your Roll Number (e.g. MCA2024-002), or click "Forgot Password?".');
    }

    if (needsRehash) {
      dbUpdateStudent(student.id, { password: inputPassword });
    }

    // Security: Force students using public Roll Number as password to set a private password
    const isDefaultRollPassword = Boolean(student.rollNo && inputPassword.toUpperCase() === student.rollNo.toUpperCase());
    const isDefaultTempPassword = inputPassword === DEFAULT_TEMP_PASSWORD;

    if (student.mustChangePassword || isDefaultRollPassword || isDefaultTempPassword) {
      s.setForceNewPasswordStudent(student);
      return;
    }
    props.onLoginStudent(student, s.rememberMe);
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    s.setErrorMessage('');
    const success = await props.onLoginAdmin(s.adminPasswordInput, s.rememberMe);
    if (!success) s.setErrorMessage('Access Denied: Incorrect Master Admin Password.');
  };

  const handleResetRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    s.setErrorMessage('');
    const cleanRoll = s.resetRollNo.trim().toUpperCase();
    const cleanContact = s.resetContact.trim();

    const student = props.existingStudents.find(
      (st) =>
        st.rollNo.toUpperCase() === cleanRoll ||
        st.email.toLowerCase() === cleanContact.toLowerCase() ||
        (st.phone && st.phone.replace(/\D/g, '') === cleanContact.replace(/\D/g, ''))
    );
    if (!student) return s.setErrorMessage(`Could not find a student matching Roll Number "${cleanRoll}".`);

    const resetReq: PasswordResetRequest = {
      id: generateUniqueId('pwreq'),
      classroomId: props.classroom.id,
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      phone: student.phone || cleanContact,
      email: student.email || cleanContact,
      note: s.resetNote.trim() || 'Student requested password reset',
      requestedAt: 'Just now',
      status: 'pending',
    };
    props.onRequestPasswordReset(resetReq);
    s.setIsResetSubmitted(true);
  };

  const handleSetNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    s.setErrorMessage('');
    if (!s.forceNewPasswordStudent) return;
    if (s.newPassword.length < 6) return s.setErrorMessage('New password must be at least 6 characters.');
    if (s.newPassword !== s.confirmPassword) return s.setErrorMessage('Passwords do not match.');

    const success = await props.onUpdateStudentPassword(s.forceNewPasswordStudent.id, s.newPassword);
    if (success) {
      props.onLoginStudent({ ...s.forceNewPasswordStudent, password: s.newPassword, mustChangePassword: false });
    } else {
      s.setErrorMessage('Failed to update password. Please try again.');
    }
  };

  return {
    handleCreateRoomSubmit,
    handleStudentJoinSubmit,
    handleStudentLoginSubmit,
    handleAdminLoginSubmit,
    handleResetRequestSubmit,
    handleSetNewPasswordSubmit,
  };
};
