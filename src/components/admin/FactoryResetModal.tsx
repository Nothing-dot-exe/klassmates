import React from 'react';
import { Trash2, RefreshCw, Download } from 'lucide-react';
import { Classroom } from '@/types';

interface FactoryResetModalProps {
  isOpen: boolean;
  classroom: Classroom;
  resetConfirmText: string;
  setResetConfirmText: (v: string) => void;
  isResetting: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const FactoryResetModal: React.FC<FactoryResetModalProps> = ({
  isOpen,
  classroom,
  resetConfirmText,
  setResetConfirmText,
  isResetting,
  onClose,
  onConfirmReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-[#27272a] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-left transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-[#222226] text-zinc-900 dark:text-rose-400 border border-zinc-200 dark:border-[#27272a] flex items-center justify-center mx-auto shadow-xs">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1.5">
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">Extract Archive & Reset Room</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            This will automatically download an official backup archive{' '}
            <code className="text-zinc-950 dark:text-white font-mono text-[11px] bg-zinc-100 dark:bg-[#222226] px-1.5 py-0.5 rounded border border-zinc-200 dark:border-[#27272a]">
              Classmate-Backup-{classroom.code}.json
            </code>{' '}
            to your device, delete all classroom data, clear your session, and return you to the Create / Login page.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] text-xs space-y-2">
          <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
            To confirm this factory reset, please type{' '}
            <strong className="text-zinc-950 dark:text-white font-mono font-bold">RESET</strong> below:
          </div>
          <input
            type="text"
            placeholder="Type RESET to confirm"
            value={resetConfirmText}
            onChange={(e) => setResetConfirmText(e.target.value)}
            className="w-full bg-white dark:bg-[#222226] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-zinc-950 dark:text-white font-mono font-bold focus:outline-none focus:border-rose-500 tracking-wider text-center shadow-xs"
          />
        </div>

        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="flex-1 py-2.5 bg-zinc-100 dark:bg-[#18181b] hover:bg-zinc-200 dark:hover:bg-[#222226] border border-zinc-200 dark:border-[#27272a] text-zinc-800 dark:text-zinc-300 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmReset}
            disabled={isResetting || resetConfirmText.trim().toUpperCase() !== 'RESET'}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-rose-950/30 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            {isResetting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download & Reset</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
