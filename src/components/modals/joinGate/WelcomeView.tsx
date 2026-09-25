import React, { useState } from 'react';
import { ShieldCheck, GraduationCap, ChevronRight, Users, Lock, Eye, EyeOff, Crown, Loader2, X } from 'lucide-react';
import { Classroom, User } from '@/types';
import { verifyPassword } from '@/lib/security/passwordUtils';

interface WelcomeViewProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onSignIn: () => void;
  classroom?: Classroom;
  existingStudents?: User[];
  onLoginStudent?: (user: User) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onCreateRoom,
  onJoinRoom,
  onSignIn,
  classroom,
  existingStudents = [],
  onLoginStudent,
}) => {
  const [showCRModal, setShowCRModal] = useState(false);
  const [crPassword, setCRPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [crError, setCRError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const hasActiveClassroom = !!(classroom && (classroom.id || classroom.name));
  const studentCount = existingStudents.length || classroom?.membersCount || 30;
  const adminStudent = existingStudents.find(
    (s) => s.id === classroom?.adminId || s.role === 'admin'
  );

  const handleCRLogin = async () => {
    if (!crPassword.trim()) {
      setCRError('Please enter the CR password.');
      return;
    }
    setIsChecking(true);
    setCRError('');
    try {
      const storedHash = classroom?.adminPassword || adminStudent?.password || '';
      if (!storedHash) {
        setCRError('No admin credentials configured for this classroom.');
        setIsChecking(false);
        return;
      }
      const { isValid } = await verifyPassword(crPassword, storedHash);
      if (isValid && adminStudent && onLoginStudent) {
        setShowCRModal(false);
        setCRPassword('');
        onLoginStudent(adminStudent);
      } else {
        setCRError('Incorrect password. Access denied.');
      }
    } catch {
      setCRError('Verification failed. Please try again.');
    }
    setIsChecking(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* CR Password Gate Modal */}
      {showCRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-card-border p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-display text-foreground">CR Access</h3>
                  <p className="text-[11px] text-muted">Enter Class Rep password to continue</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowCRModal(false); setCRPassword(''); setCRError(''); }}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#24302c] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={crPassword}
                onChange={(e) => { setCRPassword(e.target.value); setCRError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleCRLogin()}
                placeholder="CR / Admin password"
                autoFocus
                className="w-full pl-9 pr-10 py-2.5 field"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error */}
            {crError && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold px-1">{crError}</p>
            )}

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleCRLogin}
              disabled={isChecking}
              className="btn btn-accent w-full"
            >
              {isChecking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Crown className="w-4 h-4" />
              )}
              <span>{isChecking ? 'Verifying…' : 'Enter as Class Rep'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Classroom Spotlight Card */}
      {hasActiveClassroom && (
        <div className="p-4 sm:p-5 rounded-2xl bg-card-muted border border-card-border shadow-sm space-y-3 relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-card-muted border border-zinc-200 dark:border-card-border text-zinc-800 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span>Database Synced</span>
            </div>
            <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-[#24302c] border border-indigo-200 dark:border-indigo-500/30 shadow-xs">
              {classroom?.code || 'MCA2026'}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-display text-foreground tracking-tight">
              {classroom?.name || 'MCA Batch 2024–2026'}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 truncate">
              {classroom?.institution || 'School of Computer Applications & Technology'}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-200 dark:border-card-border">
            <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-300 font-semibold">
              <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{studentCount} Enrolled Students</span>
            </div>
            <span className="text-zinc-600 dark:text-zinc-400 text-[11px]">
              CR: <strong className="text-zinc-900 dark:text-amber-400">{classroom?.adminName || adminStudent?.name || 'Class Representative'}</strong>
            </span>
          </div>

          <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={onSignIn}
              className="btn btn-primary flex-1"
            >
              <span>Sign In to Classroom</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {adminStudent && onLoginStudent && (
              <button
                type="button"
                onClick={() => setShowCRModal(true)}
                className="btn btn-secondary py-2.5 px-3.5 text-amber-800 dark:text-amber-300 border-amber-500/30"
                title="Enter as Class Representative — requires password"
              >
                <span>👑 Enter as CR</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Option A: Create Classroom */}
      <button
        type="button"
        onClick={onCreateRoom}
        className="w-full text-left p-4 sm:p-5 rounded-2xl bg-card border border-card-border hover:border-primary/40 hover:shadow-lg transition-all group relative overflow-hidden cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-card-muted text-primary border border-card-border flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-card-muted text-foreground border border-card-border">
            Student Lead & CR
          </span>
        </div>

        <div className="mt-3">
          <h3 className="text-base font-display text-foreground group-hover:text-primary transition">
            Create a New Classroom
          </h3>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Set up a private classroom space for your batch or study group as Class Representative or Student Lead.
          </p>
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
          <span>Start classroom setup</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      {/* Option B: Join Classroom */}
      <button
        type="button"
        onClick={onJoinRoom}
        className="w-full text-left p-4 sm:p-5 rounded-2xl bg-card border border-card-border hover:border-primary/40 hover:shadow-lg transition-all group relative overflow-hidden cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-card-muted text-primary border border-card-border flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-card-muted text-foreground border border-card-border">
            Student Enrollment
          </span>
        </div>

        <div className="mt-3">
          <h3 className="text-base font-display text-foreground group-hover:text-primary transition">
            Join with Class Code
          </h3>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Have a room code from your class representative? Enter the code and submit your verified student enrollment.
          </p>
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
          <span>Enter with Room Code</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      {/* Bottom Sign In Link */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onSignIn}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-medium transition inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>Already enrolled in this class?</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold underline underline-offset-4">Sign In Here</span>
        </button>
      </div>
    </div>
  );
};
