'use client';

import React from 'react';
import { Reply, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { ChatReplyReference } from '@/types';

interface MessageReplyQuoteProps {
  replyTo: ChatReplyReference;
  isMine: boolean;
  onScrollToMessage?: (messageId: string) => void;
}

export const MessageReplyQuote: React.FC<MessageReplyQuoteProps> = ({
  replyTo,
  isMine,
  onScrollToMessage,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onScrollToMessage && replyTo.id) {
      onScrollToMessage(replyTo.id);
    }
  };

  const cleanContent =
    replyTo.content && replyTo.content !== '📷 Photo snapshot from study session'
      ? replyTo.content
      : '';

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left mb-1.5 p-2 rounded-xl flex items-start gap-2 border transition cursor-pointer select-none ${
        isMine
          ? 'bg-black/20 border-white/20 text-white hover:bg-black/30'
          : 'bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
      }`}
      title="Jump to quoted message"
    >
      <div className="flex-shrink-0 pt-0.5 opacity-70">
        <Reply className="w-3.5 h-3.5 scale-x-[-1]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-bold truncate ${
              isMine ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {replyTo.senderName}
          </span>
          {replyTo.senderRollNo && !replyTo.senderRollNo.includes('@') && (
            <span
              className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                isMine ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
              }`}
            >
              {replyTo.senderRollNo}
            </span>
          )}
        </div>

        <div className={`flex items-center gap-1.5 text-[11px] truncate mt-0.5 ${isMine ? 'text-zinc-300' : 'text-zinc-600 dark:text-zinc-400'}`}>
          {replyTo.imageUrl && (
            <span className="inline-flex items-center gap-0.5 font-medium">
              <ImageIcon className="w-3 h-3" /> Photo {cleanContent ? '•' : ''}
            </span>
          )}
          {replyTo.videoUrl && (
            <span className="inline-flex items-center gap-0.5 font-medium">
              <Video className="w-3 h-3" /> Video {cleanContent ? '•' : ''}
            </span>
          )}
          {replyTo.hasDocument && (
            <span className="inline-flex items-center gap-0.5 font-medium">
              <FileText className="w-3 h-3" /> Attachment {cleanContent ? '•' : ''}
            </span>
          )}
          <span className="truncate italic">
            {cleanContent || (replyTo.imageUrl ? 'Photo' : replyTo.videoUrl ? 'Video' : 'Attachment')}
          </span>
        </div>
      </div>
    </button>
  );
};
