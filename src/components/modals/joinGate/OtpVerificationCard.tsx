'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mail, Clock, AlertTriangle, AlertCircle, Copy, Check, Loader2 } from 'lucide-react';

interface OtpVerificationCardProps {
  email: string;
  otpInput: string;
  countdown: number;
  isVerifying: boolean;
  error?: string;
  onOtpInputChange: (val: string) => void;
  onVerify: () => void;
}

export const OtpVerificationCard: React.FC<OtpVerificationCardProps> = ({
  email,
  otpInput,
  countdown,
  isVerifying,
  error,
  onOtpInputChange,
  onVerify,
}) => {
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Individual digit slots 0..5
  const cleanDigits = (otpInput || '').replace(/\D/g, '').slice(0, 6);
  const digits = Array.from({ length: 6 }, (_, i) => cleanDigits[i] || '');

  const handleDigitChange = (idx: number, val: string) => {
    const numeric = val.replace(/\D/g, '');

    // Handle multi-character input (e.g. mobile auto-complete or copy-paste)
    if (numeric.length > 1) {
      const newDigits = [...digits];
      let lastIndex = idx;
      for (let i = 0; i < numeric.length && idx + i < 6; i++) {
        newDigits[idx + i] = numeric[i];
        lastIndex = idx + i;
      }
      const nextOtp = newDigits.join('');
      onOtpInputChange(nextOtp);
      const nextFocus = Math.min(lastIndex + 1, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    // Single digit typed or cleared (taking the last typed character so typing over works)
    const digitChar = numeric.slice(-1);
    const newDigits = [...digits];
    newDigits[idx] = digitChar;
    const nextOtp = newDigits.join('');
    onOtpInputChange(nextOtp);

    // Auto-advance to next box if digit was entered
    if (digitChar && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
      inputRefs.current[idx + 1]?.select();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newDigits = [...digits];
      if (!newDigits[idx] && idx > 0) {
        // Current box is already empty, move to previous box, clear it, and focus it
        newDigits[idx - 1] = '';
        onOtpInputChange(newDigits.join(''));
        inputRefs.current[idx - 1]?.focus();
        e.preventDefault();
      } else {
        // Clear current box
        newDigits[idx] = '';
        onOtpInputChange(newDigits.join(''));
        e.preventDefault();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
      inputRefs.current[idx - 1]?.select();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
      inputRefs.current[idx + 1]?.select();
      e.preventDefault();
    } else if (e.key === 'Enter' && cleanDigits.length >= 6 && !isVerifying) {
      onVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length > 0) {
      onOtpInputChange(text);
      const focusIdx = Math.min(text.length, 5);
      setTimeout(() => {
        inputRefs.current[focusIdx]?.focus();
        inputRefs.current[focusIdx]?.select();
      }, 0);
    }
  };

  const handleFocus = (idx: number, e: React.FocusEvent<HTMLInputElement>) => {
    // If user taps an empty box ahead of earlier empty boxes, redirect to the first empty box
    const firstEmpty = digits.findIndex((d) => !d);
    if (firstEmpty !== -1 && firstEmpty < idx) {
      inputRefs.current[firstEmpty]?.focus();
      return;
    }
    e.target.select();
  };

  const handleCopy = async () => {
    if (cleanDigits.length < 6) return;
    try {
      await navigator.clipboard.writeText(cleanDigits);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Auto-focus first box on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const isComplete = cleanDigits.length >= 6;

  return (
    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-[#27272a] space-y-3 animate-in fade-in shadow-xs">
      {/* Email Delivery Notice */}
      <div className="p-3 rounded-xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] flex items-start gap-2.5">
        <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
        <div className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed min-w-0">
          <p className="font-semibold text-zinc-950 dark:text-white">Check your email inbox</p>
          <p className="text-zinc-600 dark:text-zinc-400 text-[11px] mt-0.5 break-all">
            A 6-digit code was sent to{' '}
            <strong className="text-zinc-900 dark:text-indigo-300 font-mono">{email}</strong>.{' '}
            Check inbox & spam folder.
          </p>
        </div>
      </div>

      {/* Countdown */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">Enter your code:</span>
        <span className={`font-mono font-bold text-[10px] flex items-center gap-1 ${countdown <= 30 && countdown > 0 ? 'text-rose-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
          <Clock className="w-3 h-3" />
          {countdown > 0 ? `${countdown}s remaining` : 'Expired — click Resend'}
        </span>
      </div>

      {/* 6 Individual Digit Boxes */}
      <div className="flex gap-1.5 sm:gap-2 justify-center" onPaste={handlePaste}>
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete={idx === 0 ? 'one-time-code' : 'off'}
            pattern="[0-9]*"
            maxLength={2}
            value={digit}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onFocus={(e) => handleFocus(idx, e)}
            aria-label={`Digit ${idx + 1} of 6`}
            className={`w-10 h-12 sm:w-11 sm:h-13 rounded-xl border-2 text-center text-lg font-extrabold font-mono transition-all focus:outline-none ${
              digit
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 shadow-sm shadow-indigo-500/20'
                : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500'
            }`}
          />
        ))}
      </div>

      {/* In-Card Error Banner (Displays immediate feedback right above the button) */}
      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
          <span className="font-semibold text-[11px] leading-tight">{error}</span>
        </div>
      )}

      {/* Copy Code button (shows only when complete) */}
      {isComplete && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#18181b] hover:bg-zinc-200 dark:hover:bg-[#222226] border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 transition cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Confirm Button */}
      <button
        type="button"
        onClick={onVerify}
        disabled={isVerifying || !isComplete}
        className="w-full px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/20 cursor-pointer active:scale-95"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying Code…</span>
          </>
        ) : isComplete ? (
          'Confirm Code ✓'
        ) : (
          'Enter all 6 digits'
        )}
      </button>

      {/* Spam hint */}
      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 pt-0.5">
        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
        <span>Don&apos;t see the email? Check your spam/junk folder or click Resend.</span>
      </div>
    </div>
  );
};
