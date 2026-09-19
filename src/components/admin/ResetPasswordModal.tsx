import React from 'react';
import { KeyRound, ShieldCheck, X } from 'lucide-react';
import { User } from '@/types';
import { getSafeAvatar } from '@/lib/avatarUtils';
import { DEFAULT_TEMP_PASSWORD } from '@/lib/privacyUtils';

interface ResetPasswordModalProps {
  student: User | null;
  onClose: () => void;
  onConfirm: (student: User) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  student,
  onClose,
  onConfirm,
}) => {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-[#27272a] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 transition-colors">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-[#27272a] bg-zinc-50 dark:bg-[#18181b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-[#222226] text-zinc-900 dark:text-amber-400 border border-zinc-200 dark:border-[#27272a]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">HR Password Reset</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Administrative credential override</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-[#222226] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-2xl p-4 flex items-center gap-3">
            <img
              src={getSafeAvatar(student.avatar, student.name)}
              alt={student.name}
              className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-[#222226] border border-zinc-200 dark:border-[#27272a] shadow-xs"
            />
            <div className="min-w-0">
              <div className="text-sm font-bold text-zinc-950 dark:text-white truncate">{student.name}</div>
              <div className="text-xs font-mono text-zinc-700 dark:text-indigo-400 font-bold">{student.rollNo}</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{student.email}</div>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-2xl p-4 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
            <div className="font-semibold flex items-center gap-1.5 text-zinc-950 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              How HR Password Reset Works:
            </div>
            <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
              <li>
                The password will be reset to temporary default:{' '}
                <strong className="text-zinc-950 dark:text-white font-mono bg-white dark:bg-[#222226] px-1.5 py-0.5 rounded border border-zinc-200 dark:border-[#27272a]">
                  {DEFAULT_TEMP_PASSWORD}
                </strong>
              </li>
              <li>
                Upon logging in with this temporary password, the student will be{' '}
                <strong className="text-zinc-950 dark:text-white">immediately forced</strong> to set their own new permanent password.
              </li>
              <li>Any pending reset requests for this student will be marked as resolved.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-[#27272a] bg-zinc-100 dark:bg-[#18181b] text-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#222226] text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(student)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-95 text-white text-xs font-bold shadow-glow-purple transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              Reset to {DEFAULT_TEMP_PASSWORD}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
