import React from 'react';
import { Clock, ShieldCheck, Phone } from 'lucide-react';

interface WaitingRoomViewProps {
  pendingRollNo: string;
  adminName: string;
  adminPhone?: string;
  onCancel: () => void;
}

export const WaitingRoomView: React.FC<WaitingRoomViewProps> = ({
  pendingRollNo,
  adminName,
  adminPhone,
  onCancel,
}) => {
  return (
    <div className="text-center py-6 space-y-4 animate-in fade-in">
      <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping" />
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-[#24302c] border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
          <Clock className="w-7 h-7 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-zinc-950 dark:text-white">Join Request Dispatched!</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
          Your request for Roll Number <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{pendingRollNo}</strong> has been submitted to the Admin Panel.
        </p>
      </div>

      {/* Class Rep Contact in Waiting Room */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-card-muted border border-zinc-200 dark:border-card-border text-left space-y-2">
        <div className="text-[10px] uppercase font-black text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Class Representative</span>
        </div>
        <div className="text-xs font-bold text-zinc-950 dark:text-white">{adminName}</div>

        <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
          Need quick approval? Contact your Class Representative directly:
        </p>

        <div className="pt-1 flex flex-wrap items-center gap-3 text-xs">
          {adminPhone && (
            <a
              href={`tel:${adminPhone}`}
              className="text-zinc-900 dark:text-zinc-200 hover:text-indigo-500 dark:hover:text-indigo-400 font-mono font-bold flex items-center gap-1 transition"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-500" /> {adminPhone}
            </a>
          )}

        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white underline cursor-pointer"
        >
          Cancel request and return to entrance
        </button>
      </div>
    </div>
  );
};
