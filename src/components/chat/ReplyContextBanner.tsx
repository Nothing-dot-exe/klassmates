'use client';

import React from 'react';
import { Reply, X, Image as ImageIcon, Video, FileText } from 'lucide-react';
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

  const cleanContent =
    replyingTo.content && replyingTo.content !== '📷 Photo snapshot from study session'
      ? replyingTo.content
      : '';

  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-card dark:bg-[#151c28] border-l-4 border-l-indigo-600 dark:border-l-indigo-500 border border-card-border dark:border-zinc-800 rounded-2xl mb-2 shadow-md backdrop-blur-xl animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
          <Reply className="w-3.5 h-3.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-zinc-950 dark:text-white truncate">
              Replying to {senderName}
            </span>
            {replyingTo.senderRollNo && !replyingTo.senderRollNo.includes('@') && (
              <span className="text-[9px] font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-200/80 dark:bg-zinc-800 px-1.5 py-0.2 rounded border border-zinc-300 dark:border-zinc-700">
                {replyingTo.senderRollNo}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
            {replyingTo.imageUrl && (
              <span className="inline-flex items-center gap-0.5 text-zinc-800 dark:text-zinc-200 flex-shrink-0 font-medium">
                <ImageIcon className="w-3 h-3" /> Photo {cleanContent ? '•' : ''}
              </span>
            )}
            {replyingTo.videoUrl && (
              <span className="inline-flex items-center gap-0.5 text-zinc-800 dark:text-zinc-200 flex-shrink-0 font-medium">
                <Video className="w-3 h-3" /> Video {cleanContent ? '•' : ''}
              </span>
            )}
            {replyingTo.document && (
              <span className="inline-flex items-center gap-0.5 text-zinc-800 dark:text-zinc-200 flex-shrink-0 font-medium">
                <FileText className="w-3 h-3" /> {replyingTo.document.fileName} {cleanContent ? '•' : ''}
              </span>
            )}
            <span className="truncate italic">
              {cleanContent || (replyingTo.imageUrl ? 'Photo' : replyingTo.videoUrl ? 'Video' : 'Shared attachment')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="hidden sm:inline-block text-[9px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-200/80 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">
          ESC
        </span>
        <button
          type="button"
          onClick={onCancelReply}
          className="p-1 text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition active:scale-90 cursor-pointer"
          title="Cancel reply (Esc)"
          aria-label="Cancel reply"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
