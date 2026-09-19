import React from 'react';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Send } from 'lucide-react';
import { User, Classroom } from '@/types';
import { useForgotPasswordState } from './useForgotPasswordState';

interface ForgotPasswordViewProps {
  existingStudents: User[];
  classroom: Classroom;
  onBackToSignIn: () => void;
  onPasswordResetSuccess: (user: User) => void;
  setErrorMessage: (msg: string) => void;
  setSuccessMessage: (msg: string) => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = (props) => {
  const { onBackToSignIn } = props;
  const s = useForgotPasswordState(props);

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToSignIn}
          className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Email OTP Recovery</span>
      </div>

      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2.5">
        <KeyRound className="w-4 h-4 flex-shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-amber-950 dark:text-amber-200">Reset Password with Real 6-Digit Email OTP</p>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
            A numeric code will be delivered to your registered email address.
          </p>
        </div>
      </div>

      {!s.isOtpSent ? (
        <form onSubmit={s.handleSendOtp} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
              Roll Number, Registered Email, or Mobile
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 22CS045 or student@school.edu"
              value={s.identifier}
              onChange={(e) => s.setIdentifier(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 font-mono transition shadow-xs"
            />
          </div>

          <button
            type="submit"
            disabled={s.isSendingOtp}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-950/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {s.isSendingOtp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Locating Account & Dispatching Code...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send 6-Digit Code to My Email</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={s.handleResetSubmit} className="space-y-3.5">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] space-y-1">
            <div className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>
                Code sent to: <strong className="text-zinc-950 dark:text-indigo-300 font-mono">{s.maskEmail(s.targetEmail)}</strong>
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">6-Digit Verification Code</label>
              <button
                type="button"
                disabled={s.countdown > 0 || s.isSendingOtp}
                onClick={s.handleSendOtp}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-40 cursor-pointer font-semibold"
              >
                {s.countdown > 0 ? `Resend in ${s.countdown}s` : 'Resend Code'}
              </button>
            </div>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              value={s.otpCode}
              onChange={(e) => s.setOtpCode(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2.5 text-base text-center tracking-widest text-zinc-950 dark:text-white font-mono font-bold focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">New Password (min 6 chars)</label>
            <div className="relative">
              <input
                type={s.showPassword ? 'text' : 'password'}
                required
                placeholder="Enter new password"
                value={s.newPassword}
                onChange={(e) => s.setNewPassword(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 pr-10 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 font-mono transition shadow-xs"
              />
              <button
                type="button"
                onClick={() => s.setShowPassword(!s.showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer"
              >
                {s.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">Confirm New Password</label>
            <input
              type={s.showPassword ? 'text' : 'password'}
              required
              placeholder="Confirm new password"
              value={s.confirmPassword}
              onChange={(e) => s.setConfirmPassword(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 font-mono transition shadow-xs"
            />
          </div>

          <button
            type="submit"
            disabled={s.isResetting || s.otpCode.length < 6}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-950/20 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer active:scale-95"
          >
            {s.isResetting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Code & Updating Password...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Reset Password</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
