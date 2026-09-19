import { useState } from 'react';
import { Classroom, User } from '@/types';

export const useJoinGateState = (prefilledCode: string, classroom: Classroom) => {
  const [navMode, setNavMode] = useState<'welcome' | 'create_room' | 'join_room' | 'signin'>(
    prefilledCode ? 'join_room' : 'welcome'
  );

  // Sign In Sub-tab
  const [signInRole, setSignInRole] = useState<'student' | 'admin'>('student');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forceNewPasswordStudent, setForceNewPasswordStudent] = useState<User | null>(null);

  // Student Join Form
  const [joinCode, setJoinCode] = useState(prefilledCode || '');
  const [resolvedClassroom, setResolvedClassroom] = useState<Classroom | null>(
    classroom && classroom.code ? classroom : null
  );
  const [studentName, setStudentName] = useState('');
  const [studentRollNo, setStudentRollNo] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Waiting Room State
  const [isWaitingApproval, setIsWaitingApproval] = useState(false);
  const [pendingRollNo, setPendingRollNo] = useState('');

  // Create Classroom Form (Admin / Creator Identity)
  const [creatorType, setCreatorType] = useState<'teacher' | 'student'>('student');
  const [creatorDesignation, setCreatorDesignation] = useState('Class Representative (CR)');
  const [newAdminRollNo, setNewAdminRollNo] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomSection, setNewRoomSection] = useState('');
  const [newRoomSemester, setNewRoomSemester] = useState('');
  const [newRoomInstitution, setNewRoomInstitution] = useState('');
  const [newRoomCode, setNewRoomCode] = useState('CS-' + Math.floor(1000 + Math.random() * 9000));

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  // Password Reset Request
  const [resetRollNo, setResetRollNo] = useState('');
  const [resetContact, setResetContact] = useState('');
  const [resetNote, setResetNote] = useState('');
  const [isResetSubmitted, setIsResetSubmitted] = useState(false);

  // Mandatory New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status banners
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Security: Keep me signed in (false on shared campus lab PCs)
  const [rememberMe, setRememberMe] = useState(true);

  return {
    navMode, setNavMode,
    signInRole, setSignInRole,
    isForgotPassword, setIsForgotPassword,
    forceNewPasswordStudent, setForceNewPasswordStudent,
    joinCode, setJoinCode,
    resolvedClassroom, setResolvedClassroom,
    studentName, setStudentName,
    studentRollNo, setStudentRollNo,
    studentPhone, setStudentPhone,
    studentEmail, setStudentEmail,
    studentPassword, setStudentPassword,
    isWaitingApproval, setIsWaitingApproval,
    pendingRollNo, setPendingRollNo,
    creatorType, setCreatorType,
    creatorDesignation, setCreatorDesignation,
    newAdminRollNo, setNewAdminRollNo,
    newAdminName, setNewAdminName,
    newAdminPhone, setNewAdminPhone,
    newAdminEmail, setNewAdminEmail,
    newAdminPassword, setNewAdminPassword,
    newRoomName, setNewRoomName,
    newRoomSection, setNewRoomSection,
    newRoomSemester, setNewRoomSemester,
    newRoomInstitution, setNewRoomInstitution,
    newRoomCode, setNewRoomCode,
    loginIdentifier, setLoginIdentifier,
    loginPassword, setLoginPassword,
    adminPasswordInput, setAdminPasswordInput,
    resetRollNo, setResetRollNo,
    resetContact, setResetContact,
    resetNote, setResetNote,
    isResetSubmitted, setIsResetSubmitted,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    errorMessage, setErrorMessage,
    successMessage, setSuccessMessage,
    rememberMe, setRememberMe,
  };
};
