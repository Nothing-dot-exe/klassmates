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
    <div className="bg-white dark:bg-[#252526] border border-zinc-300 dark:border-[#2d2d2d] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-black text-zinc-950 dark:text-white flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-zinc-900 dark:text-white" />
          Room Lifecycle & Factory Reset
        </h4>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-900 dark:text-white font-bold border border-zinc-300 dark:border-[#4a4a4a]">
          High Privilege Action
        </span>
      </div>
      <p className="text-[11px] text-zinc-700 dark:text-[#cccccc] leading-relaxed font-medium">
        Extract complete room data and wipe the room back to a clean initial state.{' '}
        <strong className="text-zinc-950 dark:text-white">
          Before anything is reset, the system will automatically download a complete JSON archive of all messages,
          enrolled students, uploaded documents, and requests.
        </strong>{' '}
        After wiping the room, your session is cleared and you will be redirected to the Welcome / Create Classroom page.
      </p>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-300 dark:border-[#3c3c3c]">
          <div className="text-base font-black text-zinc-950 dark:text-white">{students.length}</div>
          <div className="text-[10px] text-zinc-600 dark:text-[#858585] font-semibold">Students</div>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-300 dark:border-[#3c3c3c]">
          <div className="text-base font-black text-zinc-950 dark:text-white">{totalMessagesCount}</div>
          <div className="text-[10px] text-zinc-600 dark:text-[#858585] font-semibold">Messages</div>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-300 dark:border-[#3c3c3c]">
          <div className="text-base font-black text-zinc-950 dark:text-white">{documents.length}</div>
          <div className="text-[10px] text-zinc-600 dark:text-[#858585] font-semibold">Documents</div>
        </div>
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-300 dark:border-[#3c3c3c]">
          <div className="text-base font-black text-zinc-950 dark:text-white">
            {pendingRequests.length + passwordResetRequests.length}
          </div>
          <div className="text-[10px] text-zinc-600 dark:text-[#858585] font-semibold">Requests</div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenResetConfirm}
          className="w-full py-3 rounded-xl bg-zinc-100 dark:bg-[#3c3c3c] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-900 dark:text-white hover:text-rose-700 dark:hover:text-rose-400 border border-zinc-300 dark:border-[#4a4a4a] hover:border-rose-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
        >
          <Download className="w-4 h-4 text-zinc-900 dark:text-white" />
          <span>Extract All Data & Factory Reset Room</span>
        </button>
      </div>
    </div>
  );
};
