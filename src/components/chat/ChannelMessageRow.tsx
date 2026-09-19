'use client';

import React, { useState } from 'react';
import {
  Clock,
  SmilePlus,
  Trash2,
  Reply,
  Lock,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
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

  // Reddit Karma / Upvote & Downvote calculations
  const upvotes = message.reactions?.find((r) => r.emoji === '▲')?.count || 0;
  const downvotes = message.reactions?.find((r) => r.emoji === '▼')?.count || 0;
  const netScore = upvotes - downvotes;
  const hasUpvoted = Boolean(message.reactions?.find((r) => r.emoji === '▲')?.users?.includes(currentUserId));
  const hasDownvoted = Boolean(message.reactions?.find((r) => r.emoji === '▼')?.users?.includes(currentUserId));

  return (
    <div
      id={`msg-${message.id}`}
      {...(!isMine ? touchHandlers : {})}
      className={`group relative flex w-full pt-1.5 pb-1 px-2 sm:px-4 transition-all ${
        isHighlighted ? 'bg-indigo-500/10 dark:bg-indigo-500/15 ring-1 ring-indigo-400/50 dark:ring-indigo-500/60 rounded-2xl' : ''
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

      {/* Reddit Discussion Card Container */}
      <div
        style={{ transform: !isMine && dragX > 0 ? `translateX(${dragX}px)` : undefined }}
        className="w-full flex items-start gap-2.5 sm:gap-3 bg-white dark:bg-[#0E1424] hover:bg-zinc-50/80 dark:hover:bg-[#121A2D] border border-zinc-200/80 dark:border-[#1F2A44] hover:border-zinc-300 dark:hover:border-indigo-500/30 rounded-2xl p-3 sm:p-3.5 transition shadow-sm"
      >
        {/* Left: Reddit Vertical Upvote / Downvote Score Bar */}
        <div className="flex flex-col items-center justify-start flex-shrink-0 bg-zinc-100/70 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-1 py-1 select-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReact(message.id, '▲');
            }}
            className={`p-1 rounded-lg transition active:scale-90 cursor-pointer ${
              hasUpvoted
                ? 'text-orange-600 bg-orange-100'
                : 'text-zinc-400 hover:text-orange-500 hover:bg-zinc-200/60'
            }`}
            title="Upvote (Agree / Helpful)"
          >
            <ArrowBigUp className={`w-4 h-4 ${hasUpvoted ? 'fill-orange-600' : ''}`} />
          </button>

          <span
            className={`text-[11px] font-black leading-none my-1 font-mono tracking-tight ${
              hasUpvoted
                ? 'text-orange-600 font-bold'
                : hasDownvoted
                ? 'text-zinc-900 font-bold'
                : 'text-zinc-500'
            }`}
          >
            {netScore > 0 ? `+${netScore}` : netScore}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReact(message.id, '▼');
            }}
            className={`p-1 rounded-lg transition active:scale-90 cursor-pointer ${
              hasDownvoted
                ? 'text-zinc-950 bg-zinc-200'
                : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
            title="Downvote"
          >
            <ArrowBigDown className={`w-4 h-4 ${hasDownvoted ? 'fill-zinc-950' : ''}`} />
          </button>
        </div>

        {/* Right: Header, Content, Media, and Action Footer */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Reddit Post Header */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <button
                type="button"
                onClick={() => onOpenProfile?.(message.senderId)}
                className="cursor-pointer flex-shrink-0"
                title={`View profile of ${senderDisplayName}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getSafeAvatar(message.senderAvatar, message.senderName)}
                  alt={senderDisplayName}
                  className="w-6 h-6 rounded-full object-cover bg-zinc-100 border border-zinc-200"
                />
              </button>

              <button
                type="button"
                onClick={() => onOpenProfile?.(message.senderId)}
                className="text-xs font-bold text-zinc-950 dark:text-white hover:text-zinc-700 dark:hover:text-indigo-400 hover:underline truncate cursor-pointer"
              >
                u/{senderDisplayName}
              </button>

              {isCRSender && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)] flex-shrink-0">
                  <span>👑</span>
                  <span>Class Rep</span>
                </span>
              )}

              {message.senderRollNo && !message.senderRollNo.includes('@') && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#161F36] text-slate-700 dark:text-indigo-300 border border-slate-200 dark:border-indigo-500/30 flex-shrink-0">
                  #{message.senderRollNo}
                </span>
              )}

              <span className="text-zinc-400 dark:text-zinc-600 text-xs">•</span>

              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 select-none">
                <Clock className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                {message.timestamp}
              </span>

              <span title="TLS Encrypted • Classroom Secured">
                <Lock className="w-2.5 h-2.5 text-zinc-400 dark:text-zinc-500 inline ml-0.5" />
              </span>
            </div>

            {/* Hover Quick Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              <button
                type="button"
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="p-1 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#161F36] transition cursor-pointer"
                title="Add Reaction"
              >
                <SmilePlus className="w-3.5 h-3.5" />
              </button>
              {canDelete && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-[#161F36] transition cursor-pointer"
                  title="Delete message"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Reaction Popup */}
          {showReactionPicker && (
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl shadow-xl w-fit">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(message.id, emoji);
                    setShowReactionPicker(false);
                  }}
                  className="text-sm hover:scale-125 transition-transform p-1 rounded cursor-pointer hover:bg-zinc-100 dark:hover:bg-[#161F36]"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Reply Quote context if this message is replying to another */}
          {message.replyTo && (
            <MessageReplyQuote
              replyTo={message.replyTo}
              isMine={false}
              onScrollToMessage={onScrollToMessage}
            />
          )}

          {/* Formatted Markdown Content with Links & Code Blocks */}
          {message.content && (
            <div className="text-left text-zinc-900 dark:text-zinc-200 font-[450]">
              <MessageContentRenderer
                content={message.content}
                isMine={false}
                chatMode="channel"
              />
            </div>
          )}

          {/* Image Attachment */}
          {message.imageUrl && (
            <div className="mt-2 max-w-sm rounded-xl overflow-hidden border border-zinc-200 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.imageUrl}
                alt="Shared attachment"
                className="rounded-xl object-cover max-h-72 w-auto"
              />
            </div>
          )}

          {/* Document Attachment */}
          {message.document && (
            <div className="mt-2">
              <MessageDocumentCard
                document={message.document}
                isMine={false}
                onOpenDocument={onOpenDocument}
              />
            </div>
          )}

          {/* Reddit Action Bar at the bottom */}
          <div className="flex items-center gap-2 sm:gap-3 pt-1 text-xs text-zinc-500 flex-wrap">
            <button
              type="button"
              onClick={() => onReply?.(message)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-[#121A2D] hover:bg-zinc-200 dark:hover:bg-[#161F36] text-zinc-800 dark:text-zinc-200 border border-transparent dark:border-[#1F2A44] font-semibold transition active:scale-95 cursor-pointer text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-300" />
              <span>Reply</span>
            </button>

            {/* Standard Emoji Reactions Bar */}
            <MessageReactionsBar
              reactions={message.reactions}
              currentUserId={currentUserId}
              isMine={false}
              onReact={(emoji) => onReact(message.id, emoji)}
            />

            {message.autoDelete && message.autoDelete !== 'off' && (
              <span className="flex items-center gap-0.5 text-[10px] text-zinc-600 font-medium ml-auto">
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
