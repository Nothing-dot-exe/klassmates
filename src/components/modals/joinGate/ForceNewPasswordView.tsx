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
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 space-y-1">
        <div className="text-xs font-bold text-amber-950 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-700" />
          Temporary Password Detected
        </div>
        <p className="text-[11px] text-amber-800/90 leading-relaxed">
          You are logging in with a temporary password. For security, please create a new private password now.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-800 mb-1">
          Create New Password <span className="text-zinc-900">*</span>
        </label>
        <input
          type="password"
          required
          placeholder="Min 6 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-black font-mono"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-800 mb-1">
          Confirm New Password <span className="text-zinc-900">*</span>
        </label>
        <input
          type="password"
          required
          placeholder="Repeat new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-black font-mono"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>Save Password & Enter Classroom</span>
      </button>
    </form>
  );
};
