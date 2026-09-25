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
  pendingRequests?: PendingRequest[];
  prefilledCode?: string;
  onLoginStudent: (student: User, rememberMe?: boolean) => void;
  onLoginAdmin: (adminPasswordInput: string, rememberMe?: boolean) => boolean | Promise<boolean>;
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
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in">
      <div className="bg-card/90 sm:bg-card/80 border-0 sm:border border-white/40 dark:border-white/10 rounded-none sm:rounded-[1.75rem] w-full max-w-lg overflow-hidden shadow-none sm:shadow-[0_30px_80px_-20px_rgba(88,70,245,0.45)] backdrop-blur-2xl flex flex-col my-0 sm:my-auto min-h-[100dvh] sm:min-h-0 max-h-[100dvh] sm:max-h-[96dvh] transition-colors">
        {/* Header */}
        <div className="p-5 sm:p-7 pb-5 pt-[max(3.25rem,env(safe-area-inset-top))] sm:pt-7 border-b border-card-border/80 text-center space-y-2.5 flex-shrink-0 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(88,70,245,0.16),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,rgba(124,108,255,0.22),transparent_58%)]" />
          {s.navMode !== 'welcome' && !s.isWaitingApproval && !s.forceNewPasswordStudent && (
            <button
              onClick={() => {
                s.setNavMode('welcome');
                s.setErrorMessage('');
                s.setSuccessMessage('');
                s.setIsForgotPassword(false);
              }}
              className="btn btn-secondary absolute left-4 top-[max(1rem,env(safe-area-inset-top))] sm:left-5 sm:top-5 min-h-9 px-2.5 py-1.5 z-10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          {/* Theme Toggle (Day / Dark) */}
          <div className="absolute right-4 top-4 sm:right-5 sm:top-5 z-10">
            <ThemeToggle />
          </div>

          <div className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/90 dark:bg-indigo-950/50 text-primary border border-indigo-200/80 dark:border-indigo-500/30 text-[10px] font-bold uppercase tracking-[0.14em]">
            <School className="w-3.5 h-3.5" />
            Built for class batches
          </div>

          <h2 className="relative text-[1.7rem] sm:text-[2rem] font-display text-foreground">
            {s.navMode === 'welcome' && 'Your class, one space'}
            {s.navMode === 'create_room' && 'Create a Classroom'}
            {s.navMode === 'join_room' && 'Join Classroom'}
            {s.navMode === 'signin' && 'Welcome back'}
          </h2>

          <p className="relative text-sm text-muted max-w-sm mx-auto leading-relaxed">
            {s.navMode === 'welcome' && 'Create a private classroom for your batch, or join with a class code.'}
            {s.navMode === 'create_room' && 'Set up a private space and register as the classroom administrator.'}
            {s.navMode === 'join_room' && 'Enter your class code and request enrollment from your Class Representative.'}
            {s.navMode === 'signin' && 'Open your channels, notes, and study threads.'}
          </p>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto no-scrollbar space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
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
              adminOtpError={otp.adminOtpError}
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
              studentOtpError={otp.studentOtpError}
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
              rememberMe={s.rememberMe}
              setRememberMe={s.setRememberMe}
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
