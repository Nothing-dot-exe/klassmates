'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Hash, Lock, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Channel, ChatMessage, DocumentItem, User, AutoDeleteOption, ChatReplyReference } from '@/types';
import { getSafeAvatar } from '@/lib/avatarUtils';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { DeleteMessageModal } from './DeleteMessageModal';
import { ClearChatModal } from './ClearChatModal';
import { ChatWallpaperModal } from './ChatWallpaperModal';
import { CHAT_BACKGROUNDS, getThemedBackgroundStyle } from './chatBackgrounds';
import { useTheme } from '@/hooks/useTheme';

interface ChatContainerProps {
  currentChannel?: Channel;
  currentRecipient?: User;
  adminUser?: User;
  messages: ChatMessage[];
  currentUser: User;
  defaultAutoDelete: AutoDeleteOption;
  onSendMessage: (payload: {
    content: string;
    autoDelete: AutoDeleteOption;
    imageUrl?: string;
    document?: DocumentItem;
    replyTo?: ChatReplyReference;
  }) => void;
  onOpenDocument: (doc: DocumentItem) => void;
  onReact: (messageId: string, emoji: string) => void;
  onAddDocumentToHub: (doc: DocumentItem) => void;
  onDeleteMessage?: (messageId: string) => void;
  onDeleteForMe?: (messageId: string) => void;
  onClearChat?: () => void;
  onOpenProfileById?: (userId: string) => void;
  typingUser?: { userName: string; userAvatar?: string } | null;
  onTyping?: (isTyping: boolean) => void;
  onBack?: () => void;
}

/** Returns a label like "Today", "Yesterday", or "8 September 2026" */
function getDateLabel(timestamp: string): string {
  // timestamp is like "11:29 PM" — we need real dates stored on the message
  // We'll use the message's stored date label if available, otherwise use today
  // For now we parse from the JS Date at message-creation time embedded in id
  return timestamp; // overridden below via message._dateLabel
}

function formatDateSeparator(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Extract YYYY-MM-DD bucket from message id (msg_<timestamp>) or fallback to today */
function msgDateBucket(msg: ChatMessage): string {
  const ts = parseInt(msg.id.replace('msg_', ''), 10);
  if (!isNaN(ts) && ts > 1_000_000_000_000) {
    return new Date(ts).toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  currentChannel,
  currentRecipient,
  adminUser,
  messages,
  currentUser,
  defaultAutoDelete,
  onSendMessage,
  onOpenDocument,
  onReact,
  onAddDocumentToHub,
  onDeleteMessage,
  onDeleteForMe,
  onClearChat,
  onOpenProfileById,
  typingUser,
  onTyping,
  onBack,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [deleteTargetMessage, setDeleteTargetMessage] = useState<ChatMessage | null>(null);
  const [isClearChatOpen, setIsClearChatOpen] = useState(false);
  const [chatBgId, setChatBgId] = useState<string>('doodle');
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('classmate_chat_bg');
      if (saved) setChatBgId(saved);
    }
  }, []);

  const handleSelectBg = (bgId: string) => {
    setChatBgId(bgId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('classmate_chat_bg', bgId);
    }
  };

  const { isDark } = useTheme();
  const themedBgStyle = getThemedBackgroundStyle(chatBgId, isDark);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, !!typingUser]);

  const handleScrollToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 2200);
    }
  };

  const hasRecipientNickname = Boolean(
    currentRecipient?.nickname &&
    currentRecipient.nickname.trim() &&
    currentRecipient.nickname.trim() !== currentRecipient.name.trim()
  );

  const title = currentChannel
    ? `#${currentChannel.name}`
    : currentRecipient?.nickname?.trim() || currentRecipient?.name || 'Classroom Chat';

  const subtitle = currentChannel
    ? currentChannel.description
    : currentRecipient
    ? ''
    : 'Select a classmate from the sidebar to start chatting';

  // Build rendering list with grouping info and date separators
  type RenderItem =
    | { kind: 'date'; label: string; key: string }
    | { kind: 'msg'; msg: ChatMessage; isFirst: boolean; isLast: boolean };

  const renderItems: RenderItem[] = [];
  let lastDateBucket = '';
  let lastSenderId = '';

  messages.forEach((msg, idx) => {
    const bucket = msgDateBucket(msg);
    const nextMsg = messages[idx + 1];
    const nextBucket = nextMsg ? msgDateBucket(nextMsg) : null;

    // Date separator
    if (bucket !== lastDateBucket) {
      renderItems.push({ kind: 'date', label: formatDateSeparator(bucket), key: `date_${bucket}` });
      lastDateBucket = bucket;
      lastSenderId = ''; // reset grouping on new day
    }

    const isFirst = msg.senderId !== lastSenderId;
    const isLast = !nextMsg || nextMsg.senderId !== msg.senderId || nextBucket !== bucket;

    renderItems.push({ kind: 'msg', msg, isFirst, isLast });
    lastSenderId = msg.senderId;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#080C15] overflow-hidden min-h-0 min-w-0 transition-colors">
      {/* Chat Header */}
      <ChatHeader
        currentChannel={currentChannel}
        currentRecipient={currentRecipient}
        adminUser={adminUser}
        title={title}
        subtitle={subtitle}
        typingUser={typingUser}
        onOpenProfileById={onOpenProfileById}
        onOpenClearChat={() => setIsClearChatOpen(true)}
        onOpenWallpaper={() => setIsWallpaperModalOpen(true)}
        onBack={onBack}
      />

      {/* Messages Scroll Area with Dynamic Atmospheric Wallpaper */}
      <div
        style={themedBgStyle}
        className="flex-1 overflow-y-auto p-3 sm:p-4 no-scrollbar transition-all duration-300"
      >
        {/* Stitch Glassmorphic Pinned Announcement Card for #general */}
        {currentChannel && currentChannel.name.toLowerCase() === 'general' && (
          <div className="p-3.5 mb-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-50 to-white dark:from-[#161F36] dark:via-[#121A2D] dark:to-[#0E1424] border border-amber-500/30 shadow-md relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start justify-between relative z-10 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold text-[10px] uppercase tracking-wider">
                      📌 Milestone Notice
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      • Pinned by Class Rep
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Study Notes, Handouts & Lecture Slides in Document Vault
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Syllabi, cheat sheets, and assignment submissions are organized in the Vault. Upload yours to share with classmates!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Banner - Tailored for General vs DM */}
        {currentChannel ? (
          <div className="p-6 my-4 rounded-3xl bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800/80 text-center space-y-2.5 shadow-md transition-colors">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 shadow-inner">
              <Hash className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight font-display">Welcome to #{currentChannel.name}!</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Classroom Hall
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              This is the official discussion channel for your classroom. Announcements, class questions, and shared notes posted here are visible to all enrolled classmates.
            </p>
            <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                <Users className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Class Discussions
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Realtime Sync
              </span>
            </div>
          </div>
        ) : currentRecipient ? (
          <div className="p-6 my-4 rounded-3xl bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800/80 text-center space-y-3 shadow-md transition-colors">
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getSafeAvatar(currentRecipient.avatar, currentRecipient.name)}
                alt={currentRecipient.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/30 mx-auto shadow-sm bg-slate-100 dark:bg-slate-800"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-[#0E1424] ${
                  currentRecipient.status === 'studying'
                    ? 'bg-amber-400'
                    : currentRecipient.status === 'online'
                    ? 'bg-emerald-500'
                    : 'bg-slate-400'
                }`}
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2 flex-wrap">
                {hasRecipientNickname ? (
                  <>
                    <span>{currentRecipient.nickname?.trim()}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">({currentRecipient.name})</span>
                  </>
                ) : (
                  <span>{currentRecipient.name}</span>
                )}
                {currentRecipient.rollNo && (
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
                    #{currentRecipient.rollNo}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                {currentRecipient.bio || 'Direct 1-on-1 classmate conversation'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[10.5px] text-slate-600 dark:text-slate-400 font-medium">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>End-to-End Direct Chat • Private between you and {currentRecipient.nickname?.trim() || currentRecipient.name}</span>
            </div>
          </div>
        ) : null}

        {/* Rendered items */}
        {renderItems.map((item) => {
          if (item.kind === 'date') {
            return (
              <div key={item.key} className="flex items-center gap-3 my-5 px-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800/80" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#121A2D] border border-slate-200 dark:border-slate-800 px-3 py-0.5 rounded-full tracking-wider uppercase select-none shadow-2xs font-mono">
                  {item.label}
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800/80" />
              </div>
            );
          }

          const { msg, isFirst, isLast } = item;
          return (
            <MessageItem
              key={msg.id}
              message={msg}
              currentUserId={currentUser.id}
              currentUserRole={currentUser.role}
              isHighlighted={msg.id === highlightedMessageId}
              isFirst={isFirst}
              isLast={isLast}
              chatMode={currentChannel ? 'channel' : 'dm'}
              onOpenDocument={onOpenDocument}
              onReact={onReact}
              onDeleteMessage={onDeleteMessage}
              onRequestDelete={(m) => setDeleteTargetMessage(m)}
              onOpenProfile={onOpenProfileById}
              onReply={(m) => {
                if (m.senderId !== currentUser.id) setReplyingTo(m);
              }}
              onScrollToMessage={handleScrollToMessage}
            />
          );
        })}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex items-end gap-2 sm:gap-2.5 px-1 sm:px-3 py-1.5 mt-1">
            {typingUser.userAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={typingUser.userAvatar}
                alt={typingUser.userName}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0 mb-1"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold flex items-center justify-center text-xs flex-shrink-0 mb-1">
                {typingUser.userName[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex items-center gap-2 bg-white dark:bg-[#121A2D] border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-xs">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 typing-dot-1" />
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 typing-dot-2" />
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 typing-dot-3" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-1">
                {typingUser.userName} is typing...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput
        placeholder={`Message ${title}...`}
        defaultAutoDelete={defaultAutoDelete}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onSendMessage={onSendMessage}
        onAddDocumentToHub={onAddDocumentToHub}
        onTyping={onTyping}
      />

      <DeleteMessageModal
        isOpen={Boolean(deleteTargetMessage)}
        message={deleteTargetMessage}
        canDeleteForEveryone={Boolean(
          deleteTargetMessage?.senderId === currentUser.id ||
          currentUser.role === 'admin'
        )}
        onClose={() => setDeleteTargetMessage(null)}
        onDeleteForEveryone={(id) => {
          onDeleteMessage?.(id);
          setDeleteTargetMessage(null);
        }}
        onDeleteForMe={(id) => {
          onDeleteForMe?.(id);
          setDeleteTargetMessage(null);
        }}
      />

      <ClearChatModal
        isOpen={isClearChatOpen}
        conversationTitle={title}
        messages={messages}
        onClose={() => setIsClearChatOpen(false)}
        onClear={() => {
          onClearChat?.();
          setIsClearChatOpen(false);
        }}
      />

      <ChatWallpaperModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        currentBgId={chatBgId}
        onSelectBg={handleSelectBg}
      />
    </div>
  );
};
