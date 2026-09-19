'use client';

import React from 'react';
import { Reply, Image as ImageIcon, FileText } from 'lucide-react';
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

  const senderDisplayName = replyTo.senderName?.includes('@')
    ? replyTo.senderName.split('@')[0]
    : replyTo.senderName || 'Classmate';

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left mb-1.5 px-2.5 py-1.5 rounded-xl border-l-[3.5px] transition-all duration-150 active:scale-[0.99] cursor-pointer group flex items-start gap-2 ${
        isMine
          ? 'bg-white/10 hover:bg-white/15 border-white/60 text-white/90'
          : 'bg-zinc-100/90 hover:bg-zinc-200/80 border-zinc-950 text-zinc-900'
      }`}
      title="Click to view original message"
    >
      <div className={`flex-shrink-0 pt-0.5 group-hover:scale-110 transition-transform ${isMine ? 'text-white/80' : 'text-zinc-900'}`}>
        <Reply className="w-3.5 h-3.5" />
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[11px] font-bold truncate group-hover:underline ${
              isMine ? 'text-white' : 'text-zinc-950'
            }`}
          >
            {senderDisplayName}
          </span>
          {replyTo.senderRollNo && !replyTo.senderRollNo.includes('@') && (
            <span
              className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                isMine ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-700 border border-zinc-300'
              }`}
            >
              {replyTo.senderRollNo}
            </span>
          )}
        </div>

        <div className={`flex items-center gap-1.5 text-[11px] truncate mt-0.5 ${isMine ? 'text-zinc-300' : 'text-zinc-600'}`}>
          {replyTo.imageUrl && (
            <span className="inline-flex items-center gap-0.5 font-medium">
              <ImageIcon className="w-3 h-3" /> Photo •
            </span>
          )}
          {replyTo.hasDocument && (
            <span className="inline-flex items-center gap-0.5 font-medium">
              <FileText className="w-3 h-3" /> Attachment •
            </span>
          )}
          <span className="truncate italic">
            {replyTo.content || (replyTo.imageUrl ? 'Photo' : 'Attachment')}
          </span>
        </div>
      </div>
    </button>
  );
};
