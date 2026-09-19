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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-left">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center mx-auto shadow-xs">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1.5">
          <h3 className="text-base font-bold text-zinc-950">Extract Archive & Reset Room</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            This will automatically download an official backup archive{' '}
            <code className="text-zinc-950 font-mono text-[11px] bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
              Classmate-Backup-{classroom.code}.json
            </code>{' '}
            to your device, delete all classroom data, clear your session, and return you to the Create / Login page.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-2">
          <div className="text-[11px] text-zinc-600">
            To confirm this factory reset, please type{' '}
            <strong className="text-zinc-950 font-mono font-bold">RESET</strong> below:
          </div>
          <input
            type="text"
            placeholder="Type RESET to confirm"
            value={resetConfirmText}
            onChange={(e) => setResetConfirmText(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-950 font-mono font-bold focus:outline-none focus:border-zinc-950 tracking-wider text-center"
          />
        </div>

        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmReset}
            disabled={isResetting || resetConfirmText.trim().toUpperCase() !== 'RESET'}
            className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
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
