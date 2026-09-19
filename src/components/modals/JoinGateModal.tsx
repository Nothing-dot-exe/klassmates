'use client';

import React, { useEffect } from 'react';
import { School, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Classroom, User, PendingRequest, PasswordResetRequest } from '@/types';
import { CURRENT_USER } from '@/lib/mockData';
import { dbFetchClassroomByCode } from '@/lib/databaseService';

import { WelcomeView } from './joinGate/WelcomeView';
import { CreateRoomView } from './joinGate/CreateRoomView';
import { JoinRoomView } from './joinGate/JoinRoomView';
import { WaitingRoomView } from './joinGate/WaitingRoomView';
import { SignInView } from './joinGate/SignInView';
import { ForceNewPasswordView } from './joinGate/ForceNewPasswordView';
import { useJoinGateState } from './joinGate/useJoinGateState';
import { useJoinGateOtp } from './joinGate/useJoinGateOtp';
import { useApprovalListener } from './joinGate/useApprovalListener';
import { useJoinGateActions } from './joinGate/useJoinGateActions';

import { ThemeToggle } from '@/components/common/ThemeToggle';

interface JoinGateModalProps {
  classroom: Classroom;
  existingStudents: User[];
  prefilledCode?: string;
  onLoginStudent: (student: User) => void;
  onLoginAdmin: (adminPasswordInput: string) => boolean | Promise<boolean>;
  onRegisterTeacher?: (teacher: User) => void;
  onCreateClassroom?: (classroom: Classroom, admin: User) => void;
  onJoinSubmitted: (req: PendingRequest, classroomId?: string) => void;
  onJoinDirect: (student: User) => void;
  onRequestPasswordReset: (req: PasswordResetRequest) => void;
  onUpdateStudentPassword: (studentId: string, newPassword: string) => Promise<boolean>;
}

export const JoinGateModal: React.FC<JoinGateModalProps> = (props) => {
  const { classroom, existingStudents, prefilledCode = '' } = props;
  const s = useJoinGateState(prefilledCode, classroom);

  const adminUser =
    existingStudents.find((u) => u.role === 'admin' || u.id === classroom.adminId) ||
    CURRENT_USER;

  const publicAdminName = classroom.adminName || adminUser.name;
  const publicAdminPhone = classroom.adminPhone || adminUser.phone || '';
  const publicAdminEmail = classroom.adminEmail || adminUser.email || '';

  const otp = useJoinGateOtp(s.newAdminEmail, s.studentEmail, s.setErrorMessage, s.setSuccessMessage);

  useApprovalListener(
    s.isWaitingApproval,
    s.pendingRollNo,
    existingStudents,
    s.resolvedClassroom?.id || classroom.id || '',
    props.onLoginStudent,
    s.setIsWaitingApproval,
    (reason) => {
      s.setIsWaitingApproval(false);
      s.setErrorMessage(reason || 'Your join request was declined by the room admin.');
      s.setNavMode('join_room');
    }
  );

  const act = useJoinGateActions(s, otp, props);

  useEffect(() => {
    if (prefilledCode) {
      s.setJoinCode(prefilledCode.toUpperCase());
      s.setNavMode('join_room');
    }
  }, [prefilledCode]);

  useEffect(() => {
    const cleanCode = s.joinCode.trim().toUpperCase();
    if (!cleanCode) {
      s.setResolvedClassroom(null);
      return;
    }
    if (classroom && classroom.code && cleanCode === classroom.code.toUpperCase()) {
      s.setResolvedClassroom(classroom);
      return;
    }

    let isMounted = true;
    const lookup = async () => {
      const found = await dbFetchClassroomByCode(cleanCode);
      if (isMounted) s.setResolvedClassroom(found || null);
    };
    if (cleanCode.length >= 4) {
      lookup();
    } else {
      s.setResolvedClassroom(null);
    }
    return () => {
      isMounted = false;
    };
  }, [s.joinCode, classroom]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto no-scrollbar animate-in fade-in transition-colors">
      <div className="bg-white dark:bg-[#121214] border border-zinc-200/90 dark:border-[#27272a] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-zinc-950/20 dark:shadow-black/70 flex flex-col my-auto max-h-[96dvh] transition-colors">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] text-center space-y-2 flex-shrink-0 relative">
          {s.navMode !== 'welcome' && !s.isWaitingApproval && !s.forceNewPasswordStudent && (
            <button
              onClick={() => {
                s.setNavMode('welcome');
                s.setErrorMessage('');
                s.setSuccessMessage('');
                s.setIsForgotPassword(false);
              }}
              className="absolute left-4 top-4 sm:left-5 sm:top-5 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 text-xs font-bold transition shadow-xs cursor-pointer z-10 active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          {/* Theme Toggle (Day / Dark) */}
          <div className="absolute right-4 top-4 sm:right-5 sm:top-5 z-10">
            <ThemeToggle />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-[#222226] text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
            <School className="w-3.5 h-3.5" />
            Classmate Collaboration Hub
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
            {s.navMode === 'welcome' && 'Welcome to Classmate'}
            {s.navMode === 'create_room' && 'Create a Classroom'}
            {s.navMode === 'join_room' && 'Join Classroom'}
            {s.navMode === 'signin' && 'Sign In to Classmate'}
          </h2>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {s.navMode === 'welcome' && 'Choose whether you want to set up a new classroom or join an existing batch.'}
            {s.navMode === 'create_room' && 'Launch a private classroom and register as the verified Administrator.'}
            {s.navMode === 'join_room' && 'Enter your class code and request verified enrollment from your Class Representative.'}
            {s.navMode === 'signin' && 'Access your student study groups, class notes, and channels.'}
          </p>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto no-scrollbar space-y-4">
          {s.errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{s.errorMessage}</span>
            </div>
          )}

          {s.successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{s.successMessage}</span>
            </div>
          )}

          {s.navMode === 'welcome' && !s.forceNewPasswordStudent && (
            <WelcomeView
              onCreateRoom={() => {
                s.setNavMode('create_room');
                s.setErrorMessage('');
              }}
              onJoinRoom={() => {
                s.setNavMode('join_room');
                s.setErrorMessage('');
              }}
              onSignIn={() => {
                s.setNavMode('signin');
                s.setErrorMessage('');
              }}
              classroom={classroom}
              existingStudents={existingStudents}
              onLoginStudent={props.onLoginStudent}
            />
          )}

          {s.navMode === 'create_room' && (
            <CreateRoomView
              creatorType={s.creatorType}
              setCreatorType={s.setCreatorType}
              creatorDesignation={s.creatorDesignation}
              setCreatorDesignation={s.setCreatorDesignation}
              newAdminRollNo={s.newAdminRollNo}
              setNewAdminRollNo={s.setNewAdminRollNo}
              newAdminName={s.newAdminName}
              setNewAdminName={s.setNewAdminName}
              newAdminPhone={s.newAdminPhone}
              setNewAdminPhone={s.setNewAdminPhone}
              newAdminEmail={s.newAdminEmail}
              setNewAdminEmail={s.setNewAdminEmail}
              newAdminPassword={s.newAdminPassword}
              setNewAdminPassword={s.setNewAdminPassword}
              newRoomName={s.newRoomName}
              setNewRoomName={s.setNewRoomName}
              newRoomSection={s.newRoomSection}
              setNewRoomSection={s.setNewRoomSection}
              newRoomSemester={s.newRoomSemester}
              setNewRoomSemester={s.setNewRoomSemester}
              newRoomInstitution={s.newRoomInstitution}
              setNewRoomInstitution={s.setNewRoomInstitution}
              newRoomCode={s.newRoomCode}
              setNewRoomCode={s.setNewRoomCode}
              isAdminEmailVerified={otp.isAdminEmailVerified}
              isAdminSendingOtp={otp.isAdminSendingOtp}
              adminOtpSent={otp.adminOtpSent}
              adminOtpCountdown={otp.adminOtpCountdown}
              adminOtpInput={otp.adminOtpInput}
              isAdminVerifyingOtp={otp.isAdminVerifyingOtp}
              setAdminOtpInput={otp.setAdminOtpInput}
              onSendAdminOtp={otp.handleSendAdminOtp}
              onVerifyAdminOtp={otp.handleVerifyAdminOtp}
              onSubmit={act.handleCreateRoomSubmit}
            />
          )}

          {s.navMode === 'join_room' && !s.isWaitingApproval && !s.forceNewPasswordStudent && (
            <JoinRoomView
              joinCode={s.joinCode}
              setJoinCode={s.setJoinCode}
              resolvedClassroom={s.resolvedClassroom}
              studentName={s.studentName}
              setStudentName={s.setStudentName}
              studentRollNo={s.studentRollNo}
              setStudentRollNo={s.setStudentRollNo}
              studentPhone={s.studentPhone}
              setStudentPhone={s.setStudentPhone}
              studentEmail={s.studentEmail}
              setStudentEmail={s.setStudentEmail}
              studentPassword={s.studentPassword}
              setStudentPassword={s.setStudentPassword}
              isStudentEmailVerified={otp.isStudentEmailVerified}
              isStudentSendingOtp={otp.isStudentSendingOtp}
              studentOtpSent={otp.studentOtpSent}
              studentOtpCountdown={otp.studentOtpCountdown}
              studentOtpInput={otp.studentOtpInput}
              isStudentVerifyingOtp={otp.isStudentVerifyingOtp}
              setStudentOtpInput={otp.setStudentOtpInput}
              onSendStudentOtp={otp.handleSendStudentOtp}
              onVerifyStudentOtp={otp.handleVerifyStudentOtp}
              onSubmit={act.handleStudentJoinSubmit}
            />
          )}

          {s.isWaitingApproval && (
            <WaitingRoomView
              pendingRollNo={s.pendingRollNo}
              adminName={publicAdminName}
              adminPhone={publicAdminPhone}
              adminEmail={publicAdminEmail}
              onCancel={() => s.setIsWaitingApproval(false)}
            />
          )}

          {s.navMode === 'signin' && !s.forceNewPasswordStudent && (
            <SignInView
              signInRole={s.signInRole}
              setSignInRole={s.setSignInRole}
              loginIdentifier={s.loginIdentifier}
              setLoginIdentifier={s.setLoginIdentifier}
              loginPassword={s.loginPassword}
              setLoginPassword={s.setLoginPassword}
              adminPasswordInput={s.adminPasswordInput}
              setAdminPasswordInput={s.setAdminPasswordInput}
              isForgotPassword={s.isForgotPassword}
              setIsForgotPassword={s.setIsForgotPassword}
              onStudentLoginSubmit={act.handleStudentLoginSubmit}
              onAdminLoginSubmit={act.handleAdminLoginSubmit}
              existingStudents={existingStudents}
              classroom={classroom}
              onPasswordResetSuccess={(resetUser) => {
                s.setIsForgotPassword(false);
                props.onLoginStudent(resetUser);
              }}
              setErrorMessage={s.setErrorMessage}
              setSuccessMessage={s.setSuccessMessage}
            />
          )}

          {s.forceNewPasswordStudent && (
            <ForceNewPasswordView
              newPassword={s.newPassword}
              setNewPassword={s.setNewPassword}
              confirmPassword={s.confirmPassword}
              setConfirmPassword={s.setConfirmPassword}
              onSubmit={act.handleSetNewPasswordSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};
