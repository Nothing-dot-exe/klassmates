'use client';

import React, { useState } from 'react';
import {
  Clock,
  SmilePlus,
  Trash2,
  Reply,
  Lock,
} from 'lucide-react';
import { ChatMessage, DocumentItem, UserRole } from '@/types';
import { MessageReplyQuote } from './MessageReplyQuote';
import { useSwipeToReply } from './useSwipeToReply';
import { MessageDocumentCard } from './MessageDocumentCard';
import { MessageReactionsBar } from './MessageReactionsBar';
import { MessageContentRenderer } from './MessageContentRenderer';
import { getSafeAvatar } from '@/lib/avatarUtils';

const QUICK_REACTIONS = ['👍', '❤️', '💡', '🔥', '🎯', '🚀'];

export interface ChannelMessageRowProps {
  message: ChatMessage;
  currentUserId: string;
  currentUserRole?: UserRole;
  isHighlighted?: boolean;
  onOpenDocument: (doc: DocumentItem) => void;
  onReact: (messageId: string, emoji: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onRequestDelete?: (message: ChatMessage) => void;
  onOpenProfile?: (userId: string) => void;
  onReply?: (message: ChatMessage) => void;
  onScrollToMessage?: (messageId: string) => void;
}

export const ChannelMessageRow: React.FC<ChannelMessageRowProps> = ({
  message,
  currentUserId,
  currentUserRole,
  isHighlighted,
  onOpenDocument,
  onReact,
  onDeleteMessage,
  onRequestDelete,
  onOpenProfile,
  onReply,
  onScrollToMessage,
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const isMine = message.senderId === currentUserId;
  const canDelete = isMine || currentUserRole === 'admin';

  const { dragX, touchHandlers } = useSwipeToReply({
    onReply: () => {
      if (!isMine) onReply?.(message);
    },
  });

  const handleDeleteClick = () => {
    if (onRequestDelete) {
      onRequestDelete(message);
    } else if (onDeleteMessage) {
      onDeleteMessage(message.id);
    }
  };

  const senderDisplayName = message.senderName?.includes('@')
    ? message.senderName.split('@')[0]
    : message.senderName || 'Classmate';

  const isCRSender =
    message.senderRollNo?.toLowerCase() === 'cr' ||
    message.senderRollNo?.toLowerCase() === 'cr-lead' ||
    message.senderName?.toLowerCase().includes('class rep') ||
    message.senderName?.toLowerCase().includes('admin');

  return (
    <div
      id={`msg-${message.id}`}
      {...(!isMine ? touchHandlers : {})}
      className={`group relative flex w-full py-1.5 sm:py-2 px-2 sm:px-4 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors rounded-xl ${
        isHighlighted
          ? 'bg-indigo-500/10 dark:bg-indigo-500/15 ring-1 ring-indigo-500/40 rounded-xl'
          : ''
      }`}
    >
      {/* Swipe reply indicator on mobile */}
      {!isMine && dragX > 5 && (
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-zinc-950 text-white shadow-md pointer-events-none z-10"
          style={{ opacity: Math.min(dragX / 35, 1) }}
        >
          <Reply className="w-4 h-4" />
        </div>
      )}

      {/* Floating Hover Action Bar (Top Right) */}
      <div className="absolute right-3 -top-3 hidden group-hover:flex items-center gap-0.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 shadow-md rounded-lg px-1 py-0.5 z-20 transition-all">
        <button
          type="button"
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
          title="Add Reaction"
        >
          <SmilePlus className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onReply?.(message)}
          className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
          title="Reply to message"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>

        {canDelete && (
          <button
            type="button"
            onClick={handleDeleteClick}
            className="p-1.5 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            title="Delete message"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Reaction Popup */}
      {showReactionPicker && (
        <div className="absolute right-3 top-4 flex items-center gap-1 p-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-30">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onReact(message.id, emoji);
                setShowReactionPicker(false);
              }}
              className="text-sm hover:scale-125 transition-transform p-1.5 rounded cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Row: Avatar (Left) + Content (Right) */}
      <div
        style={{ transform: !isMine && dragX > 0 ? `translateX(${dragX}px)` : undefined }}
        className="flex items-start gap-3 w-full min-w-0"
      >
        {/* Sender Avatar */}
        <button
          type="button"
          onClick={() => onOpenProfile?.(message.senderId)}
          className="flex-shrink-0 mt-0.5 rounded-full overflow-hidden hover:opacity-90 transition active:scale-95 cursor-pointer ring-1 ring-zinc-200 dark:ring-zinc-800"
          title={`View ${senderDisplayName}'s profile`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getSafeAvatar(message.senderAvatar, message.senderName)}
            alt={senderDisplayName}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover bg-zinc-100 dark:bg-zinc-800"
          />
        </button>

        {/* Message Column */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header Info */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap leading-none">
            <button
              type="button"
              onClick={() => onOpenProfile?.(message.senderId)}
              className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline cursor-pointer truncate"
            >
              {senderDisplayName}
            </button>

            {isCRSender && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <span>👑</span>
                <span>Class Rep</span>
              </span>
            )}

            {message.senderRollNo && !message.senderRollNo.includes('@') && (
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                #{message.senderRollNo}
              </span>
            )}

            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 ml-0.5 select-none font-medium">
              <Clock className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
              {message.timestamp}
            </span>

            <span title="TLS Encrypted • Classroom Secured">
              <Lock className="w-2.5 h-2.5 text-zinc-400 dark:text-zinc-500 inline" />
            </span>
          </div>

          {/* Reply Quote banner if quoting a previous message */}
          {message.replyTo && (
            <MessageReplyQuote
              replyTo={message.replyTo}
              isMine={false}
              onScrollToMessage={onScrollToMessage}
            />
          )}

          {/* Formatted Message Body */}
          {message.content && (
            <div className="text-xs sm:text-sm text-zinc-900 dark:text-zinc-200 font-[450] leading-relaxed break-words">
              <MessageContentRenderer
                content={message.content}
                isMine={false}
                chatMode="channel"
              />
            </div>
          )}

          {/* Attached Image */}
          {message.imageUrl && (
            <div className="mt-2 max-w-sm rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.imageUrl}
                alt="Shared attachment"
                className="rounded-xl object-cover max-h-72 w-auto"
              />
            </div>
          )}

          {/* Attached Document */}
          {message.document && (
            <div className="mt-2 max-w-md">
              <MessageDocumentCard
                document={message.document}
                isMine={false}
                onOpenDocument={onOpenDocument}
              />
            </div>
          )}

          {/* Reactions Bar and Auto-Delete indicator */}
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <MessageReactionsBar
              reactions={message.reactions}
              currentUserId={currentUserId}
              isMine={false}
              onReact={(emoji) => onReact(message.id, emoji)}
            />

            {message.autoDelete && message.autoDelete !== 'off' && (
              <span className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                <Clock className="w-3 h-3" />
                <span>{message.autoDelete}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
