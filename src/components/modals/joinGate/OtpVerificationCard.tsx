import React from 'react';
import { Mail, Clock, AlertTriangle } from 'lucide-react';

interface OtpVerificationCardProps {
  email: string;
  otpInput: string;
  countdown: number;
  isVerifying: boolean;
  onOtpInputChange: (val: string) => void;
  onVerify: () => void;
}

export const OtpVerificationCard: React.FC<OtpVerificationCardProps> = ({
  email,
  otpInput,
  countdown,
  isVerifying,
  onOtpInputChange,
  onVerify,
}) => {
  return (
    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#0E1424] border border-zinc-200 dark:border-[#1F2A44] space-y-3 animate-in fade-in shadow-xs">
      {/* Informative Email Delivery Notice */}
      <div className="p-3 rounded-xl bg-white dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] flex items-start gap-2.5">
        <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
        <div className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
          <p className="font-semibold text-zinc-950 dark:text-white">Check your email inbox</p>
          <p className="text-zinc-600 dark:text-zinc-400 text-[11px] mt-0.5">
            A 6-digit verification code was sent to <strong className="text-zinc-900 dark:text-indigo-300 font-mono">{email}</strong>.
            Please check your inbox and spam folder.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">Enter 6-digit code received in email:</span>
        <span className="text-zinc-900 dark:text-white font-mono font-bold text-[10px] flex items-center gap-1">
          <Clock className="w-3 h-3 text-zinc-500" />
          {countdown > 0 ? `${countdown}s remaining` : 'Expired — click Resend'}
        </span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          placeholder="123456"
          value={otpInput}
          onChange={(e) => onOtpInputChange(e.target.value.replace(/\D/g, ''))}
          className="flex-1 bg-white dark:bg-[#121A2D] border border-zinc-300 dark:border-[#1F2A44] rounded-xl px-3 py-2 text-sm text-zinc-950 dark:text-white text-center font-mono tracking-widest font-extrabold focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-xs"
        />
        <button
          type="button"
          onClick={onVerify}
          disabled={isVerifying || otpInput.length < 6}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-indigo-950/20 cursor-pointer active:scale-95"
        >
          {isVerifying ? 'Verifying...' : 'Confirm'}
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 pt-0.5">
        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
        <span>Don&apos;t see the email? Check your spam/junk folder or click Resend.</span>
      </div>
    </div>
  );
};
