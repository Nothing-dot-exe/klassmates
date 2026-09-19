'use client';

import React, { useState } from 'react';
import { Trash2, EyeOff, X, AlertTriangle } from 'lucide-react';
import { ChatMessage } from '@/types';

interface DeleteMessageModalProps {
  isOpen: boolean;
  message: ChatMessage | null;
  canDeleteForEveryone: boolean;
  onClose: () => void;
  onDeleteForEveryone: (messageId: string) => void;
  onDeleteForMe: (messageId: string) => void;
}

export const DeleteMessageModal: React.FC<DeleteMessageModalProps> = ({
  isOpen,
  message,
  canDeleteForEveryone,
  onClose,
  onDeleteForEveryone,
  onDeleteForMe,
}) => {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  if (!isOpen || !message) return null;

  const handleConfirmEveryone = () => {
    if (dontAskAgain) {
      try {
        localStorage.setItem('classmate_delete_mode', 'everyone');
      } catch {}
    }
    onDeleteForEveryone(message.id);
    onClose();
  };

  const handleConfirmMe = () => {
    if (dontAskAgain) {
      try {
        localStorage.setItem('classmate_delete_mode', 'me');
      } catch {}
    }
    onDeleteForMe(message.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0E1424] border border-zinc-200 dark:border-[#1F2A44] p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-zinc-900">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-[#161F36] border border-zinc-200 dark:border-[#1F2A44] text-zinc-900 dark:text-rose-400 shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Delete Message?</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Choose how to remove this message</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#161F36] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Snippet Preview */}
        <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 italic">
          &ldquo;{message.content || (message.imageUrl ? 'Photo' : 'Attachment')}&rdquo;
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          {canDeleteForEveryone && (
            <button
              type="button"
              onClick={handleConfirmEveryone}
              className="w-full py-2.5 px-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-rose-950/30 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete for everyone</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirmMe}
            className="w-full py-2.5 px-3 rounded-2xl bg-zinc-100 dark:bg-[#161F36] hover:bg-zinc-200 dark:hover:bg-[#1c2744] active:scale-95 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition flex items-center justify-center gap-2 border border-zinc-200 dark:border-[#1F2A44] cursor-pointer shadow-xs"
          >
            <EyeOff className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Delete for me</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Don't ask again toggle */}
        <div className="pt-2 border-t border-zinc-200 dark:border-[#1F2A44] flex items-center justify-center gap-2">
          <label className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 text-rose-600 focus:ring-rose-500"
            />
            <span>Don&apos;t ask again (remember choice)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
