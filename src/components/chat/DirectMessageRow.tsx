'use client';

import React, { useState } from 'react';
import {
  Clock,
  SmilePlus,
  Trash2,
  Reply,
  Lock,
  MoreHorizontal,
} from 'lucide-react';
import { ChatMessage, DocumentItem, UserRole } from '@/types';
import { MessageReplyQuote } from './MessageReplyQuote';
import { useSwipeToReply } from './useSwipeToReply';
import { MessageDocumentCard } from './MessageDocumentCard';
import { MessageReactionsBar } from './MessageReactionsBar';
import { MessageContentRenderer } from './MessageContentRenderer';
import { getSafeAvatar } from '@/lib/avatarUtils';

const QUICK_REACTIONS = ['👍', '❤️', '💡', '🔥', '🎯', '🚀'];

export interface DirectMessageRowProps {
  message: ChatMessage;
  currentUserId: string;
  currentUserRole?: UserRole;
  isHighlighted?: boolean;
  isFirst?: boolean;
  onOpenDocument: (doc: DocumentItem) => void;
  onReact: (messageId: string, emoji: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onRequestDelete?: (message: ChatMessage) => void;
  onOpenProfile?: (userId: string) => void;
  onReply?: (message: ChatMessage) => void;
  onScrollToMessage?: (messageId: string) => void;
}

export const DirectMessageRow: React.FC<DirectMessageRowProps> = ({
  message,
  currentUserId,
  currentUserRole,
  isHighlighted,
  isFirst = true,
  onOpenDocument,
  onReact,
  onDeleteMessage,
  onRequestDelete,
  onOpenProfile,
  onReply,
  onScrollToMessage,
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const isMine = Boolean(
    message.senderId === currentUserId ||
    (currentUserId && message.senderId?.toLowerCase() === currentUserId.toLowerCase())
  );
  // Any participant in a DM can initiate delete (sender can delete for everyone or for me; recipient can delete for me only)
  const canDelete = true;

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

  const rowPy = isFirst ? 'pt-2.5 sm:pt-3' : 'pt-0.5 sm:pt-1';

  return (
    <div
      id={`msg-${message.id}`}
      {...(!isMine ? touchHandlers : {})}
      className={`group relative flex w-full ${rowPy} pb-0 px-2 sm:px-4 ${
        isMine ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Swipe reply indicator */}
      {!isMine && dragX > 5 && (
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-zinc-950 text-white shadow-md pointer-events-none z-0"
          style={{ opacity: Math.min(dragX / 35, 1) }}
        >
          <Reply className="w-4 h-4" />
        </div>
      )}

      {/* Other user's avatar for incoming messages in DM */}
      {!isMine && (
        <div className="flex-shrink-0 mr-2 sm:mr-2.5 self-end mb-1">
          {isFirst ? (
            <button
              type="button"
              onClick={() => onOpenProfile?.(message.senderId)}
              className="p-[1px] rounded-full hover:ring-2 hover:ring-zinc-950 transition cursor-pointer"
              title={`View ${senderDisplayName}'s Profile`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getSafeAvatar(message.senderAvatar, message.senderName)}
                alt={senderDisplayName}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover bg-zinc-100 border border-zinc-200"
              />
            </button>
          ) : (
            <div className="w-7 sm:w-8" />
          )}
        </div>
      )}

      {/* Message Column Container */}
      <div
        style={{ transform: !isMine && dragX > 0 ? `translateX(${dragX}px)` : undefined }}
        className={`flex flex-col max-w-[85%] sm:max-w-[76%] md:max-w-[66%] relative transition-transform duration-75 ${
          isMine ? 'items-end' : 'items-start'
        }`}
      >
        {/* Floating Action Bar (Hover on desktop, tap to toggle on mobile) */}
        <div
          className={`flex items-center gap-0.5 mb-1 bg-card dark:bg-card-muted border border-card-border dark:border-card-border rounded-2xl px-1.5 py-0.5 shadow-md z-20 transition-all duration-200 ${
            showActions
              ? 'opacity-100 scale-100'
              : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
          } ${isMine ? 'self-end' : 'self-start'}`}
        >
          <button
            type="button"
            onClick={() => onReply?.(message)}
            className="p-1 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-[#24302c] transition cursor-pointer"
            title="Reply"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="p-1 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-[#24302c] transition cursor-pointer"
            title="React with Emoji"
          >
            <SmilePlus className="w-3.5 h-3.5" />
          </button>

          {canDelete && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="p-1 rounded-xl text-zinc-400 dark:text-zinc-400 hover:text-rose-600 dark:hover:bg-[#24302c] transition cursor-pointer"
              title="Delete message or photo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {showReactionPicker && (
            <div className="flex items-center gap-0.5 pl-1.5 border-l border-card-border dark:border-card-border">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(message.id, emoji);
                    setShowReactionPicker(false);
                  }}
                  className="text-sm hover:scale-125 transition-transform p-0.5 rounded cursor-pointer hover:bg-zinc-100 dark:hover:bg-[#24302c]"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Rich Message Bubble or Clean Media Container */}
        {(() => {
          const hasMedia = Boolean(message.imageUrl || message.videoUrl);
          const hasValidText = Boolean(
            message.content &&
            message.content.trim() &&
            message.content !== '📷 Photo snapshot from study session'
          );
          const isMediaOnly = hasMedia && !hasValidText && !message.document && !message.replyTo;

          return (
            <div
              className={`relative transition-all duration-300 ${
                isHighlighted ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-[#09090b] rounded-2xl' : ''
              } ${
                isMediaOnly
                  ? 'p-0.5 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-900 shadow-sm'
                  : isMine
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-2xl rounded-tr-xs shadow-md shadow-indigo-950/20 px-3.5 py-2'
                  : 'bg-card dark:bg-card border border-card-border dark:border-card-border text-zinc-950 dark:text-zinc-100 rounded-2xl rounded-tl-xs shadow-sm px-3.5 py-2'
              }`}
            >
              {/* Reply Quote preview inside the bubble */}
              {message.replyTo && (
                <MessageReplyQuote
                  replyTo={message.replyTo}
                  isMine={isMine}
                  onScrollToMessage={onScrollToMessage}
                />
              )}

              {/* Formatted Text Content */}
              {hasValidText && (
                <div className="text-left">
                  <MessageContentRenderer
                    content={message.content}
                    isMine={isMine}
                    chatMode="dm"
                  />
                </div>
              )}

              {/* Image Attachment */}
              {message.imageUrl && (
                <div className={`relative max-w-sm rounded-xl overflow-hidden group/photo inline-block ${hasValidText ? 'mt-1.5' : ''}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={message.imageUrl}
                    alt="Shared photo"
                    onClick={() => setShowActions(!showActions)}
                    className="rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 object-cover max-h-72 sm:max-h-80 w-auto shadow-xs cursor-pointer"
                  />
                  {canDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick();
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/75 hover:bg-rose-600 text-white shadow-md transition sm:opacity-0 sm:group-hover/photo:opacity-100 cursor-pointer"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Video Attachment */}
              {message.videoUrl && (
                <div className={`relative max-w-sm rounded-xl overflow-hidden bg-black group/video ${hasValidText ? 'mt-1.5' : ''}`}>
                  <video
                    src={message.videoUrl}
                    controls
                    className="rounded-xl max-h-72 sm:max-h-80 w-full object-contain"
                  />
                  {canDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick();
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/75 hover:bg-rose-600 text-white shadow-md transition sm:opacity-0 sm:group-hover/video:opacity-100 cursor-pointer"
                      title="Delete video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Document Attachment */}
              {message.document && (
                <div className="mt-1.5">
                  <MessageDocumentCard
                    document={message.document}
                    isMine={isMine}
                    onOpenDocument={onOpenDocument}
                  />
                </div>
              )}

              {/* Micro-Footer: Timestamp & Status */}
              {isMediaOnly ? (
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-xs text-white text-[10px] font-medium select-none shadow-sm">
                  {message.autoDelete && message.autoDelete !== 'off' && (
                    <span
                      className="flex items-center gap-0.5 text-[9px] font-semibold text-zinc-300"
                      title={message.expiresAt ? `Expires: ${message.expiresAt}` : 'Disappearing message'}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{message.autoDelete}</span>
                    </span>
                  )}
                  <span>{message.timestamp}</span>
                  <Lock className="w-2.5 h-2.5 opacity-70" />
                  {/* Mobile Actions Menu Trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(!showActions);
                    }}
                    className="sm:hidden p-0.5 text-white/70 hover:text-white rounded transition cursor-pointer"
                    title="Message options"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div
                  className={`flex items-center justify-end gap-1.5 mt-1 select-none ${
                    isMine ? 'text-zinc-400' : 'text-zinc-400'
                  }`}
                >
                  {message.autoDelete && message.autoDelete !== 'off' && (
                    <span
                      className={`flex items-center gap-0.5 text-[9px] font-semibold ${isMine ? 'text-zinc-400' : 'text-zinc-500'}`}
                      title={message.expiresAt ? `Expires: ${message.expiresAt}` : 'Disappearing message'}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{message.autoDelete}</span>
                    </span>
                  )}

                  <span className="text-[10px] font-medium tracking-tight">
                    {message.timestamp}
                  </span>

                  <span title="Protected message">
                    <Lock className="w-2.5 h-2.5 opacity-60" />
                  </span>

                  {/* Mobile Actions Menu Trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(!showActions);
                    }}
                    className="sm:hidden p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded transition cursor-pointer"
                    title="Message options"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* Reaction Badges */}
        <MessageReactionsBar
          reactions={message.reactions}
          currentUserId={currentUserId}
          isMine={isMine}
          onReact={(emoji) => onReact(message.id, emoji)}
        />
      </div>
    </div>
  );
};
