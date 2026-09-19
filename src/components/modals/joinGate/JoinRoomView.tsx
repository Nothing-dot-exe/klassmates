import React, { useState } from 'react';
import { Hash, User as UserIcon, Check, Eye, EyeOff, UserPlus } from 'lucide-react';
import { Classroom } from '@/types';
import { PublicAdminCard } from './PublicAdminCard';
import { OtpVerificationCard } from './OtpVerificationCard';

interface JoinRoomViewProps {
  joinCode: string;
  setJoinCode: (v: string) => void;
  resolvedClassroom: Classroom | null;
  studentName: string;
  setStudentName: (v: string) => void;
  studentRollNo: string;
  setStudentRollNo: (v: string) => void;
  studentPhone: string;
  setStudentPhone: (v: string) => void;
  studentEmail: string;
  setStudentEmail: (v: string) => void;
  studentPassword: string;
  setStudentPassword: (v: string) => void;
  isStudentEmailVerified: boolean;
  isStudentSendingOtp: boolean;
  studentOtpSent: boolean;
  studentOtpCountdown: number;
  studentOtpInput: string;
  isStudentVerifyingOtp: boolean;
  setStudentOtpInput: (v: string) => void;
  onSendStudentOtp: () => void;
  onVerifyStudentOtp: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const JoinRoomView: React.FC<JoinRoomViewProps> = ({
  joinCode,
  setJoinCode,
  resolvedClassroom,
  studentName,
  setStudentName,
  studentRollNo,
  setStudentRollNo,
  studentPhone,
  setStudentPhone,
  studentEmail,
  setStudentEmail,
  studentPassword,
  setStudentPassword,
  isStudentEmailVerified,
  isStudentSendingOtp,
  studentOtpSent,
  studentOtpCountdown,
  studentOtpInput,
  isStudentVerifyingOtp,
  setStudentOtpInput,
  onSendStudentOtp,
  onVerifyStudentOtp,
  onSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} autoComplete="off" className="space-y-4 animate-in fade-in">
      {/* Step 1: Room Code */}
      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] space-y-2">
        <label className="block text-xs font-bold text-zinc-950 dark:text-white">
          Enter Class Invite Code
        </label>
        <div className="relative">
          <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            required
            autoComplete="off"
            placeholder="e.g. CS-4891"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="w-full bg-white dark:bg-[#121214] border border-zinc-300 dark:border-[#27272a] rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 font-mono tracking-widest font-extrabold uppercase transition shadow-xs"
          />
        </div>
      </div>

      {/* Verified Public Admin Card */}
      {resolvedClassroom ? (
        <PublicAdminCard classroom={resolvedClassroom} />
      ) : joinCode.length >= 4 ? (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
          <span>No classroom found with code <strong className="font-mono text-indigo-600 dark:text-indigo-400">{joinCode}</strong>. Please check the code with your Class Representative.</span>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] text-zinc-600 dark:text-zinc-400 text-xs text-center font-medium">
          <span>Enter your class invite code above to load Class Representative details.</span>
        </div>
      )}

      {/* Step 2: Student Enrollment Information */}
      <div className="space-y-3 pt-1">
        <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-1.5">
          <UserIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Your Student Enrollment Information</span>
        </h4>

        <div>
          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
            Student Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            autoComplete="off"
            placeholder="e.g. Aditi Sharma"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
              Roll Number / Student ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoComplete="off"
              placeholder="e.g. 22CS045"
              value={studentRollNo}
              onChange={(e) => setStudentRollNo(e.target.value.toUpperCase())}
              className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-indigo-600 dark:text-indigo-400 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 font-mono font-bold transition shadow-xs uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
              Mobile Number <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <input
              type="tel"
              autoComplete="off"
              placeholder="+91 98765 43210"
              value={studentPhone}
              onChange={(e) => setStudentPhone(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 font-mono transition shadow-xs"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Email Address <span className="text-rose-500">*</span>
            </label>
            {isStudentEmailVerified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Email Verified
              </span>
            ) : null}
          </div>

          <div className="flex gap-2">
            <input
              type="email"
              required
              autoComplete="off"
              disabled={isStudentEmailVerified}
              placeholder="student@college.edu"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className={`flex-1 bg-zinc-50 dark:bg-[#18181b] border ${
                isStudentEmailVerified
                  ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
                  : 'border-zinc-200 dark:border-[#27272a] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500'
              } rounded-xl px-3.5 py-2 text-xs focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-xs`}
            />
            {!isStudentEmailVerified && (
              <button
                type="button"
                onClick={onSendStudentOtp}
                disabled={isStudentSendingOtp || studentOtpCountdown > 0}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold transition whitespace-nowrap shadow-md shadow-indigo-950/20 active:scale-95 cursor-pointer"
              >
                {isStudentSendingOtp
                  ? 'Sending...'
                  : studentOtpCountdown > 0
                  ? `Resend (${studentOtpCountdown}s)`
                  : studentOtpSent
                  ? 'Resend Code'
                  : 'Send Code'}
              </button>
            )}
          </div>

          {studentOtpSent && !isStudentEmailVerified && (
            <OtpVerificationCard
              email={studentEmail}
              otpInput={studentOtpInput}
              countdown={studentOtpCountdown}
              isVerifying={isStudentVerifyingOtp}
              onOtpInputChange={setStudentOtpInput}
              onVerify={onVerifyStudentOtp}
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
            Create Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Min 6 characters"
              value={studentPassword}
              onChange={(e) => setStudentPassword(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 pr-10 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition font-mono shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-950/30 transition flex items-center justify-center gap-2 mt-2 active:scale-[0.99] cursor-pointer"
      >
        <UserPlus className="w-4 h-4" />
        <span>Submit Join Request to Admin</span>
      </button>
    </form>
  );
};
