import React from 'react';
import { Download, Trash2 } from 'lucide-react';
import { User, DocumentItem, PendingRequest, PasswordResetRequest } from '@/types';

interface FactoryResetCardProps {
  students: User[];
  documents: DocumentItem[];
  pendingRequests: PendingRequest[];
  passwordResetRequests: PasswordResetRequest[];
  totalMessagesCount: number;
  onOpenResetConfirm: () => void;
}

export const FactoryResetCard: React.FC<FactoryResetCardProps> = ({
  students,
  documents,
  pendingRequests,
  passwordResetRequests,
  totalMessagesCount,
  onOpenResetConfirm,
}) => {
  return (
    <div className="bg-card border border-zinc-200 dark:border-card-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-black text-zinc-950 dark:text-white flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-500" />
          Room Lifecycle & Factory Reset
        </h4>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-500/30">
          High Privilege Action
        </span>
      </div>
      <p className="text-[11px] text-zinc-700 dark:text-zinc-400 leading-relaxed font-medium">
        Extract complete room data and wipe the room back to a clean initial state.{' '}
        <strong className="text-zinc-950 dark:text-white">
          Before anything is reset, the system will automatically download a complete JSON archive of all messages,
          enrolled students, uploaded documents, and requests.
        </strong>{' '}
        After wiping the room, your session is cleared and you will be redirected to the Welcome / Create Classroom page.
      </p>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-card-muted border border-zinc-200 dark:border-card-border">
          <div className="text-base font-black text-zinc-950 dark:text-white">{students.length}</div>
          <div className="text-[10px] text-zinc-600 dark:text-zinc-400 font-semibold">Students</div>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-card-muted border border-zinc-200 dark:border-card-border">
          <div className="text-base font-black text-zinc-950 dark:text-white">{totalMessagesCount}</div>
          <div className="text-[10px] text-zinc-600 dark:text-zinc-400 font-semibold">Messages</div>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-card-muted border border-zinc-200 dark:border-card-border">
          <div className="text-base font-black text-zinc-950 dark:text-white">{documents.length}</div>
          <div className="text-[10px] text-zinc-600 dark:text-zinc-400 font-semibold">Documents</div>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-card-muted border border-zinc-200 dark:border-card-border">
          <div className="text-base font-black text-zinc-950 dark:text-white">
            {pendingRequests.length + passwordResetRequests.length}
          </div>
          <div className="text-[10px] text-zinc-600 dark:text-zinc-400 font-semibold">Requests</div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenResetConfirm}
          className="w-full py-3 rounded-xl bg-zinc-100 dark:bg-[#24302c] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-900 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 border border-zinc-200 dark:border-card-border hover:border-rose-500/30 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
        >
          <Download className="w-4 h-4 text-rose-500" />
          <span>Extract All Data & Factory Reset Room</span>
        </button>
      </div>
    </div>
  );
};
