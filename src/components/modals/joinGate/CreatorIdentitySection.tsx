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
      <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
        <UserIcon className="w-3.5 h-3.5" />
        1. Class Representative / Creator Identity
      </h4>

      {/* Student Organizer Identity Banner */}
      <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white text-zinc-900 border border-zinc-200 flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
          🎒
        </div>
        <div>
          <div className="text-xs font-bold text-zinc-950 flex items-center gap-1.5">
            <span>Student Classroom Organizer</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-800">
              Peer Lead
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-tight mt-0.5">
            Classmate is 100% student-run. You are creating this classroom as the Class Representative (CR) or Student Lead.
          </p>
        </div>
      </div>

      {/* Step 1B: Title / Designation */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-800">
            Designation / Role Title <span className="text-zinc-900">*</span>
          </label>
          <span className="text-[10px] text-zinc-500">Shown on profile & roster</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            'Class Representative (CR)',
            'Student Coordinator',
            'Study Group Lead',
            'Batch Representative',
            'Classmate',
          ].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setCreatorDesignation(preset)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition border cursor-pointer ${
                creatorDesignation === preset
                  ? 'bg-black text-white border-black shadow-xs'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:text-black hover:bg-zinc-100'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        <input
          type="text"
          required
          placeholder="e.g. Class Representative (CR)"
          value={creatorDesignation}
          onChange={(e) => setCreatorDesignation(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-black transition"
        />
      </div>

      {/* Step 1C: Student Roll Number / USN */}
      <div>
        <label className="block text-xs font-medium text-zinc-800 mb-1">
          Your Student Roll Number / USN <span className="text-zinc-900">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="e.g. 1MS21CS042"
          value={newAdminRollNo}
          onChange={(e) => setNewAdminRollNo(e.target.value.toUpperCase())}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-black transition font-mono uppercase"
        />
        <p className="text-[10px] text-zinc-500 mt-1">
          Your official college roll number or USN for identification.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-800 mb-1">
          Your Full Name <span className="text-zinc-900">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Rahul Verma"
          value={newAdminName}
          onChange={(e) => setNewAdminName(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-black transition"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-800 mb-1">
          Mobile / WhatsApp Number <span className="text-zinc-900">*</span>
        </label>
        <input
          type="tel"
          required
          placeholder="+91 98765 43210"
          value={newAdminPhone}
          onChange={(e) => setNewAdminPhone(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-black transition font-mono"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-800">
            Student Email Address <span className="text-zinc-900">*</span>
          </label>
          {isAdminEmailVerified ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" /> Email Verified
            </span>
          ) : null}
        </div>

        <div className="flex gap-2">
          <input
            type="email"
            required
            disabled={isAdminEmailVerified}
            placeholder="student@institution.edu"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            className={`flex-1 bg-zinc-50 border ${
              isAdminEmailVerified ? 'border-emerald-500 text-emerald-800' : 'border-zinc-200 text-zinc-900'
            } rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:border-black transition`}
          />
          {!isAdminEmailVerified && (
            <button
              type="button"
              onClick={onSendAdminOtp}
              disabled={isAdminSendingOtp || adminOtpCountdown > 0}
              className="px-3.5 py-2 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-bold transition whitespace-nowrap shadow-xs"
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
        <label className="block text-xs font-medium text-zinc-800 mb-1">
          Master Admin Password <span className="text-zinc-900">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Enter master password (min 6 characters)"
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 pr-10 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-black transition font-mono"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-zinc-500 mt-1">
          Used to unlock Admin settings, manage students, and approve join requests.
        </p>
      </div>
    </div>
  );
};
