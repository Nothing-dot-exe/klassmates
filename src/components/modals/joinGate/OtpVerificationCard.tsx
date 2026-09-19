'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mail, Clock, AlertTriangle, Copy, Check } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Keep individual digit boxes in sync with parent state
  const digits = otpInput.padEnd(6, '').split('').slice(0, 6);

  const handleDigitChange = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1); // only last digit
    const arr = otpInput.padEnd(6, '').split('').slice(0, 6);
    arr[idx] = clean;
    const next = arr.join('').replace(/\s/g, '');
    onOtpInputChange(next);
    // Auto-advance
    if (clean && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[idx] && idx > 0) {
        // Move to previous box and clear it
        const arr = otpInput.padEnd(6, '').split('').slice(0, 6);
        arr[idx - 1] = '';
        onOtpInputChange(arr.join(''));
        inputRefs.current[idx - 1]?.focus();
      } else {
        const arr = otpInput.padEnd(6, '').split('').slice(0, 6);
        arr[idx] = '';
        onOtpInputChange(arr.join(''));
      }
    }
    if (e.key === 'Enter' && otpInput.replace(/\s/g, '').length >= 6) {
      onVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length > 0) {
      onOtpInputChange(text);
      // focus last filled box
      const focusIdx = Math.min(text.length, 5);
      setTimeout(() => inputRefs.current[focusIdx]?.focus(), 0);
    }
    e.preventDefault();
  };

  const handleCopy = async () => {
    if (!otpInput || otpInput.replace(/\s/g, '').length < 6) return;
    try {
      await navigator.clipboard.writeText(otpInput.replace(/\s/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — select the hidden input
    }
  };

  // Auto-focus first box on mount
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

  const cleanCode = otpInput.replace(/\s/g, '');
  const isComplete = cleanCode.length >= 6;

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
            pattern="[0-9]*"
            maxLength={1}
            value={digit.trim()}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onFocus={(e) => e.target.select()}
            className={`w-10 h-12 sm:w-11 sm:h-13 rounded-xl border-2 text-center text-lg font-extrabold font-mono transition-all focus:outline-none ${
              digit.trim()
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 shadow-sm shadow-indigo-500/20'
                : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500'
            }`}
          />
        ))}
      </div>

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
        {isVerifying ? 'Verifying…' : isComplete ? 'Confirm Code ✓' : 'Enter all 6 digits'}
      </button>

      {/* Spam hint */}
      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 pt-0.5">
        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
        <span>Don&apos;t see the email? Check your spam/junk folder or click Resend.</span>
      </div>
    </div>
  );
};
