import React, { useState } from 'react';
import { GraduationCap, ShieldCheck, LogIn, Lock, Eye, EyeOff } from 'lucide-react';
import { User, Classroom } from '@/types';
import { ForgotPasswordView } from './ForgotPasswordView';

interface SignInViewProps {
  signInRole: 'student' | 'admin';
  setSignInRole: (role: 'student' | 'admin') => void;
  loginIdentifier: string;
  setLoginIdentifier: (v: string) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  adminPasswordInput: string;
  setAdminPasswordInput: (v: string) => void;
  isForgotPassword: boolean;
  setIsForgotPassword: (v: boolean) => void;
  onStudentLoginSubmit: (e: React.FormEvent) => void;
  onAdminLoginSubmit: (e: React.FormEvent) => void;
  existingStudents?: User[];
  classroom?: Classroom;
  onPasswordResetSuccess?: (user: User) => void;
  setErrorMessage?: (msg: string) => void;
  setSuccessMessage?: (msg: string) => void;
  rememberMe?: boolean;
  setRememberMe?: (v: boolean) => void;
}

export const SignInView: React.FC<SignInViewProps> = ({
  signInRole,
  setSignInRole,
  loginIdentifier,
  setLoginIdentifier,
  loginPassword,
  setLoginPassword,
  adminPasswordInput,
  setAdminPasswordInput,
  isForgotPassword,
  setIsForgotPassword,
  onStudentLoginSubmit,
  onAdminLoginSubmit,
  existingStudents = [],
  classroom,
  onPasswordResetSuccess,
  setErrorMessage,
  setSuccessMessage,
  rememberMe = true,
  setRememberMe,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  if (isForgotPassword && classroom && onPasswordResetSuccess && setErrorMessage && setSuccessMessage) {
    return (
      <ForgotPasswordView
        existingStudents={existingStudents}
        classroom={classroom}
        onBackToSignIn={() => setIsForgotPassword(false)}
        onPasswordResetSuccess={onPasswordResetSuccess}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
      />
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Role Toggle */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-100 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] transition-colors">
        <button
          type="button"
          onClick={() => setSignInRole('student')}
          className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            signInRole === 'student'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950/30'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student Sign In</span>
        </button>

        <button
          type="button"
          onClick={() => setSignInRole('admin')}
          className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            signInRole === 'admin'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-950/30'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Class Rep (Admin)</span>
        </button>
      </div>

      {/* Student Sign In Form */}
      {signInRole === 'student' ? (
        <form onSubmit={onStudentLoginSubmit} autoComplete="off" className="space-y-3.5">
          {/* Private Classroom Security Notice (No Public Member Enumeration) */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-[#27272a] flex items-center gap-2.5 text-left">
            <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-tight">
              <strong className="text-zinc-900 dark:text-zinc-200">Private Classroom Workspace:</strong> Restricted to enrolled classmates. Enter your credentials below.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
              Roll Number, Email, or Mobile
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 1MS21CS042 or student@institution.edu"
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">Password</label>
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-[11px] text-zinc-600 dark:text-indigo-400 hover:text-black dark:hover:text-indigo-300 underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your account password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 pr-10 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10.5px] text-zinc-500 dark:text-zinc-500 mt-1">
              Initial password is your Roll Number or the password set during enrollment.
            </p>
          </div>

          {/* Remember Me / Shared Lab PC Security Toggle */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe?.(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                Keep me signed in on this device
              </span>
            </label>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
              (Uncheck on lab PCs)
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-950/30 transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Classroom</span>
          </button>
        </form>
      ) : (
        /* Admin Sign In Form */
        <form onSubmit={onAdminLoginSubmit} className="space-y-3.5">
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-amber-500/25 text-left space-y-1">
            <div className="text-xs font-bold text-zinc-950 dark:text-amber-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              Class Representative Security Gate
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
              Enter Class Representative / Admin password to manage classroom settings.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">Master Admin Password</label>
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-[11px] text-zinc-600 dark:text-indigo-400 hover:text-black dark:hover:underline underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter admin password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 pr-10 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me / Shared Lab PC Security Toggle for Admin */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe?.(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                Keep CR session active on this device
              </span>
            </label>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
              (Uncheck on public PCs)
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-amber-950/30 transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Unlock Admin Center</span>
          </button>
        </form>
      )}
    </div>
  );
};
