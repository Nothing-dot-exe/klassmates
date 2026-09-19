import React, { useState } from 'react';
import { User as UserIcon, Check, Eye, EyeOff } from 'lucide-react';
import { OtpVerificationCard } from './OtpVerificationCard';

export interface CreatorIdentitySectionProps {
  creatorType: 'teacher' | 'student';
  setCreatorType: (v: 'teacher' | 'student') => void;
  creatorDesignation: string;
  setCreatorDesignation: (v: string) => void;
  newAdminRollNo: string;
  setNewAdminRollNo: (v: string) => void;
  newAdminName: string;
  setNewAdminName: (v: string) => void;
  newAdminPhone: string;
  setNewAdminPhone: (v: string) => void;
  newAdminEmail: string;
  setNewAdminEmail: (v: string) => void;
  newAdminPassword: string;
  setNewAdminPassword: (v: string) => void;
  isAdminEmailVerified: boolean;
  isAdminSendingOtp: boolean;
  adminOtpSent: boolean;
  adminOtpCountdown: number;
  adminOtpInput: string;
  isAdminVerifyingOtp: boolean;
  setAdminOtpInput: (v: string) => void;
  onSendAdminOtp: () => void;
  onVerifyAdminOtp: () => void;
}

export const CreatorIdentitySection: React.FC<CreatorIdentitySectionProps> = ({
  creatorType, setCreatorType, creatorDesignation, setCreatorDesignation,
  newAdminRollNo, setNewAdminRollNo, newAdminName, setNewAdminName,
  newAdminPhone, setNewAdminPhone, newAdminEmail, setNewAdminEmail,
  newAdminPassword, setNewAdminPassword, isAdminEmailVerified,
  isAdminSendingOtp, adminOtpSent, adminOtpCountdown, adminOtpInput,
  isAdminVerifyingOtp, setAdminOtpInput, onSendAdminOtp, onVerifyAdminOtp,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-3 pt-1">
      <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-1.5">
        <UserIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
        <span>1. Class Representative / Creator Identity</span>
      </h4>

      {/* Student Organizer Identity Banner */}
      <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#161F36] text-zinc-900 dark:text-white border border-zinc-200 dark:border-[#1F2A44] flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
          🎒
        </div>
        <div>
          <div className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
            <span>Student Classroom Organizer</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-[#161F36] text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
              Peer Lead
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-tight mt-0.5">
            Designed specifically for student Class Representatives (CRs), batch leads, and study group conveners.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
            CR / Lead Designation <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Class Representative (CR)"
            value={creatorDesignation}
            onChange={(e) => setCreatorDesignation(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#161F36] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
            Roll Number / Student ID <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 21CS001"
            value={newAdminRollNo}
            onChange={(e) => setNewAdminRollNo(e.target.value.toUpperCase())}
            className="w-full bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3.5 py-2 text-xs text-indigo-600 dark:text-indigo-400 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#161F36] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 font-mono font-bold uppercase transition shadow-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
          Your Full Legal / College Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Rahul Sharma"
          value={newAdminName}
          onChange={(e) => setNewAdminName(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#161F36] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
          Public Contact Mobile / WhatsApp Number <span className="text-rose-500">*</span>
        </label>
        <input
          type="tel"
          required
          placeholder="+91 98765 43210"
          value={newAdminPhone}
          onChange={(e) => setNewAdminPhone(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#161F36] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 font-mono transition shadow-xs"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
            Email Address <span className="text-rose-500">*</span>
          </label>
          {isAdminEmailVerified ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" /> Email Verified
            </span>
          ) : null}
        </div>

        <div className="flex gap-2">
          <input
            type="email"
            required
            disabled={isAdminEmailVerified}
            placeholder="cr.lead@college.edu"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            className={`flex-1 bg-zinc-50 dark:bg-[#121A2D] border ${
              isAdminEmailVerified
                ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
                : 'border-zinc-200 dark:border-[#1F2A44] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500'
            } rounded-xl px-3.5 py-2 text-xs focus:bg-white dark:focus:bg-[#161F36] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-xs`}
          />
          {!isAdminEmailVerified && (
            <button
              type="button"
              onClick={onSendAdminOtp}
              disabled={isAdminSendingOtp || adminOtpCountdown > 0}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold transition whitespace-nowrap shadow-md shadow-indigo-950/20 active:scale-95 cursor-pointer"
            >
              {isAdminSendingOtp
                ? 'Sending...'
                : adminOtpCountdown > 0
                ? `Resend (${adminOtpCountdown}s)`
                : adminOtpSent
                ? 'Resend Code'
                : 'Send Code'}
            </button>
          )}
        </div>

        {adminOtpSent && !isAdminEmailVerified && (
          <OtpVerificationCard
            email={newAdminEmail}
            otpInput={adminOtpInput}
            countdown={adminOtpCountdown}
            isVerifying={isAdminVerifyingOtp}
            onOtpInputChange={setAdminOtpInput}
            onVerify={onVerifyAdminOtp}
          />
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
          Master Administrator Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Min 6 characters"
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3.5 pr-10 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#161F36] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition font-mono shadow-xs"
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
  );
};
