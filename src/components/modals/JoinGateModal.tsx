'use client';

import React, { useEffect } from 'react';
import { School, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Classroom, User, PendingRequest, PasswordResetRequest } from '@/types';
import { CURRENT_USER } from '@/lib/mockData';
import { dbFetchClassroom, dbFetchClassroomByCode } from '@/lib/databaseService';

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

export interface JoinGateModalProps {
  classroom: Classroom;
  existingStudents: User[];
  pendingRequests?: PendingRequest[];
  prefilledCode?: string;
  onLoginStudent: (student: User, rememberMe?: boolean) => void;
  onLoginAdmin: (adminPasswordInput: string, rememberMe?: boolean) => boolean | Promise<boolean>;
  onRegisterTeacher?: (teacher: User) => void;
  onCreateClassroom?: (classroom: Classroom, admin: User) => void;
  onJoinSubmitted: (req: PendingRequest, classroomId?: string) => void;
  onJoinDirect: (student: User, targetClassroomId?: string) => void;
  onRequestPasswordReset: (req: PasswordResetRequest) => void;
  onUpdateStudentPassword: (studentId: string, newPassword: string) => Promise<boolean>;
  onSwitchClassroom?: (classroom: Classroom) => void;
}

export const JoinGateModal: React.FC<JoinGateModalProps> = (props) => {
  const { classroom, existingStudents, prefilledCode = '' } = props;
  const s = useJoinGateState(prefilledCode, classroom);

  const adminUser =
    existingStudents.find((u) => u.role === 'admin' || u.id === classroom.adminId) ||
    CURRENT_USER;

  const publicAdminName = classroom.adminName || adminUser.name;
  const publicAdminPhone = classroom.adminPhone || adminUser.phone || '';

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
        <div className="px-4 py-3 sm:px-6 sm:py-5 pt-[max(0.85rem,env(safe-area-inset-top))] border-b border-card-border/80 text-center flex-shrink-0 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(88,70,245,0.15),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,rgba(124,108,255,0.2),transparent_58%)]" />

          {/* Top Bar: Back Action, Academic Hub Pill, and Theme Switcher */}
          <div className="relative flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
            <div className="w-20 flex items-center justify-start">
              {s.navMode !== 'welcome' && !s.isWaitingApproval && !s.forceNewPasswordStudent ? (
                <button
                  type="button"
                  onClick={() => {
                    if (s.isForgotPassword) {
                      s.setIsForgotPassword(false);
                    } else {
                      s.setNavMode('welcome');
                    }
                    s.setErrorMessage('');
                    s.setSuccessMessage('');
                  }}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-card-border bg-card hover:bg-card-muted dark:bg-[#1a2332]/90 dark:hover:bg-[#222e42] text-foreground text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer backdrop-blur-md"
                  title="Go back"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Back</span>
                </button>
              ) : null}
            </div>

            {/* Academic Hub Pill */}
            <div className="relative inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50/90 dark:bg-indigo-950/60 text-primary border border-indigo-200/80 dark:border-indigo-500/30 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.12em] shadow-2xs">
              <School className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              <span>iClassmates Hub</span>
            </div>

            {/* Theme Toggle */}
            <div className="w-20 flex items-center justify-end">
              <ThemeToggle className="h-8 px-2 rounded-xl" />
            </div>
          </div>

          {/* Modal Title & Subtitle */}
          <div className="space-y-1 relative">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight">
              {s.navMode === 'welcome' && 'Your class, one space'}
              {s.navMode === 'create_room' && 'Create a Classroom'}
              {s.navMode === 'join_room' && 'Join Classroom'}
              {s.navMode === 'signin' && 'Welcome back'}
            </h2>

            <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto leading-normal sm:leading-relaxed">
              {s.navMode === 'welcome' && 'Create a private classroom for your batch, or join with a class code.'}
              {s.navMode === 'create_room' && 'Set up a private space and register as the classroom administrator.'}
              {s.navMode === 'join_room' && 'Enter your class code and request enrollment from your Class Representative.'}
              {s.navMode === 'signin' && 'Open your channels, notes, and study threads.'}
            </p>
          </div>
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
              onPasswordResetSuccess={async (resetUser) => {
                s.setIsForgotPassword(false);
                if (resetUser.classroomId && resetUser.classroomId !== classroom.id) {
                  try {
                    const cls = await dbFetchClassroom(resetUser.classroomId);
                    if (cls && props.onSwitchClassroom) {
                      props.onSwitchClassroom(cls);
                    }
                  } catch {}
                }
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
