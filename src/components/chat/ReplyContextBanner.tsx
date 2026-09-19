'use client';

import React from 'react';
import { Reply, X, Image as ImageIcon, FileText } from 'lucide-react';
import { ChatMessage } from '@/types';

interface ReplyContextBannerProps {
  replyingTo: ChatMessage | null;
  onCancelReply: () => void;
}

export const ReplyContextBanner: React.FC<ReplyContextBannerProps> = ({
  replyingTo,
  onCancelReply,
}) => {
  if (!replyingTo) return null;

  const senderName = replyingTo.senderName?.includes('@')
    ? replyingTo.senderName.split('@')[0]
    : replyingTo.senderName || 'Classmate';

  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-zinc-50 border-l-4 border-l-zinc-950 border border-zinc-200 rounded-2xl mb-2 shadow-xs backdrop-blur-xl animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="p-1.5 rounded-xl bg-zinc-200/80 text-zinc-900 flex-shrink-0">
          <Reply className="w-3.5 h-3.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-zinc-950 truncate">
              Replying to {senderName}
            </span>
            {replyingTo.senderRollNo && !replyingTo.senderRollNo.includes('@') && (
              <span className="text-[9px] font-mono text-zinc-700 bg-zinc-200/80 px-1.5 py-0.2 rounded border border-zinc-300">
                {replyingTo.senderRollNo}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 truncate mt-0.5">
            {replyingTo.imageUrl && (
              <span className="inline-flex items-center gap-0.5 text-zinc-800 flex-shrink-0 font-medium">
                <ImageIcon className="w-3 h-3" /> Photo
              </span>
            )}
            {replyingTo.document && (
              <span className="inline-flex items-center gap-0.5 text-zinc-800 flex-shrink-0 font-medium">
                <FileText className="w-3 h-3" /> {replyingTo.document.fileName}
              </span>
            )}
            <span className="truncate italic">
              {replyingTo.content || (replyingTo.imageUrl ? 'Photo attachment' : 'Shared attachment')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="hidden sm:inline-block text-[9px] font-mono text-zinc-500 uppercase tracking-wider bg-zinc-200/80 px-1.5 py-0.5 rounded">
          ESC
        </span>
        <button
          type="button"
          onClick={onCancelReply}
          className="p-1 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200 rounded-lg transition active:scale-90 cursor-pointer"
          title="Cancel reply (Esc)"
          aria-label="Cancel reply"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
