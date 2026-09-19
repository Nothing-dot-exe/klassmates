import React from 'react';
import { Clock, ShieldCheck, Phone, Mail } from 'lucide-react';

interface WaitingRoomViewProps {
  pendingRollNo: string;
  adminName: string;
  adminPhone?: string;
  adminEmail?: string;
  onCancel: () => void;
}

export const WaitingRoomView: React.FC<WaitingRoomViewProps> = ({
  pendingRollNo,
  adminName,
  adminPhone,
  adminEmail,
  onCancel,
}) => {
  return (
    <div className="text-center py-6 space-y-4 animate-in fade-in">
      <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-zinc-200 animate-ping" />
        <div className="w-16 h-16 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center text-zinc-950 shadow-xs">
          <Clock className="w-7 h-7 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-zinc-950">Join Request Dispatched!</h3>
        <p className="text-xs text-zinc-600 max-w-xs mx-auto">
          Your request for Roll Number <strong className="text-zinc-950 font-mono">{pendingRollNo}</strong> has been submitted to the Admin Panel.
        </p>
      </div>

      {/* Class Rep Contact in Waiting Room */}
      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-left space-y-2">
        <div className="text-[10px] uppercase font-black text-zinc-900 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
          Class Representative
        </div>
        <div className="text-xs font-bold text-zinc-950">{adminName}</div>

        <p className="text-[11px] text-zinc-600">
          Need quick approval? Contact your Class Representative directly:
        </p>

        <div className="pt-1 flex flex-wrap items-center gap-3 text-xs">
          {adminPhone && (
            <a
              href={`tel:${adminPhone}`}
              className="text-zinc-900 hover:underline font-mono font-bold flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5 text-zinc-600" /> {adminPhone}
            </a>
          )}
          {adminEmail && (
            <a
              href={`mailto:${adminEmail}`}
              className="text-zinc-800 hover:underline truncate flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5 text-zinc-600" /> {adminEmail}
            </a>
          )}
        </div>
      </div>

      <p className="text-[11px] text-zinc-500 font-medium">
        Listening for real-time approval... you will enter automatically.
      </p>

      <button
        type="button"
        onClick={onCancel}
        className="text-xs text-zinc-500 hover:text-black underline underline-offset-4 cursor-pointer"
      >
        Cancel or Edit Request
      </button>
    </div>
  );
};
