import React from 'react';
import { KeyRound, CheckCircle2 } from 'lucide-react';

interface ForceNewPasswordViewProps {
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ForceNewPasswordView: React.FC<ForceNewPasswordViewProps> = ({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-in fade-in">
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 space-y-1">
        <div className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span>Temporary Password Detected</span>
        </div>
        <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
          You are logging in with a temporary password. For security, please create a new private password now.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
          Create New Password <span className="text-rose-500">*</span>
        </label>
        <input
          type="password"
          required
          placeholder="Min 6 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 font-mono transition shadow-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
          Confirm New Password <span className="text-rose-500">*</span>
        </label>
        <input
          type="password"
          required
          placeholder="Repeat new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 font-mono transition shadow-xs"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-950/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>Save Password & Enter Classroom</span>
      </button>
    </form>
  );
};
