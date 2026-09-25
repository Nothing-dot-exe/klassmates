'use client';

import React, { useState, useEffect } from 'react';
import { User, Classroom, ChatMessage } from '@/types';
import { getSafeAvatar } from '@/lib/avatarUtils';
import { getDmConversationKey } from '@/lib/chatUtils';

interface SidebarDirectMessagesProps {
  otherStudents: User[];
  classroom: Classroom;
  selectedDmUserId: string;
  activeView: string;
  onSelectDm: (userId: string) => void;
  onOpenProfile?: (user: User) => void;
  messages?: Record<string, ChatMessage[]>;
  currentUserId?: string;
  onlineUserIds?: Set<string>;
}

export const SidebarDirectMessages: React.FC<SidebarDirectMessagesProps> = ({
  otherStudents,
  classroom,
  selectedDmUserId,
  activeView,
  onSelectDm,
  onOpenProfile,
  messages = {},
  currentUserId = '',
  onlineUserIds,
}) => {
  const [copied, setCopied] = useState(false);
  const [readTimestamps, setReadTimestamps] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined' || !currentUserId) return {};
    try {
      const stored = localStorage.getItem(`classmate_last_read_dms_${currentUserId}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const handleSelectStudent = (userId: string) => {
    if (currentUserId) {
      const now = Date.now();
      setReadTimestamps((prev) => {
        const updated = { ...prev, [userId]: now };
        try {
          localStorage.setItem(`classmate_last_read_dms_${currentUserId}`, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    }
    onSelectDm(userId);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classroom.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1">
      <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider px-2 pb-1 flex items-center justify-between">
        <span>Direct Chats (DMs)</span>
        <span className="font-mono text-xs font-semibold text-slate-400 dark:text-zinc-400">#{otherStudents.length}</span>
      </div>

      {otherStudents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 bg-card/70 p-4 text-center flex flex-col items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-zinc-800/70 flex items-center justify-center text-slate-500 dark:text-zinc-400 mb-2">
            <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="1.75" viewBox="0 0 24 24">
              <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-200 mb-1">No students added yet</h4>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-[200px] leading-relaxed mb-2.5">
            Add via Admin Panel or share Class Code with your batchmates.
          </p>
          <button
            onClick={handleCopyCode}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95 text-indigo-600 dark:text-indigo-300 text-[11px] font-semibold tracking-wide border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{copied ? 'Code Copied!' : 'Share Class Code'}</span>
          </button>
        </div>
      ) : (
        otherStudents.map((st) => {
          const isSelected = activeView === 'dm' && selectedDmUserId === st.id;

          // Determine online vs offline status (Green = Online, Red = Offline)
          const isOnline = onlineUserIds && onlineUserIds.size > 0
            ? onlineUserIds.has(st.id)
            : st.status === 'online';

          // Retrieve messages for this DM conversation
          const conversationKey = currentUserId ? getDmConversationKey(currentUserId, st.id) : `dm_${st.id}`;
          const dmMessages = messages[conversationKey] || messages[`dm_${st.id}`] || [];
          const lastMsg = dmMessages.length > 0 ? dmMessages[dmMessages.length - 1] : null;

          // Compute unread count from this student
          const lastReadTime = readTimestamps[st.id] || 0;
          const unreadCount = isSelected
            ? 0
            : dmMessages.filter((m) => m.senderId === st.id && (lastReadTime === 0 || Number(m.id?.replace(/[^0-9]/g, '')) > lastReadTime)).length;

          const hasUnread = unreadCount > 0;

          // Build social-media style preview text
          let previewText = '';
          if (lastMsg) {
            const isMine = lastMsg.senderId === currentUserId;
            const prefix = isMine ? 'You: ' : '';
            if (lastMsg.content && lastMsg.content !== '📷 Photo snapshot from study session') {
              previewText = `${prefix}${lastMsg.content}`;
            } else if (lastMsg.imageUrl) {
              previewText = `${prefix}📷 Photo`;
            } else if (lastMsg.videoUrl) {
              previewText = `${prefix}🎥 Video`;
            } else if (lastMsg.document) {
              previewText = `${prefix}📄 ${lastMsg.document.fileName}`;
            } else {
              previewText = `${prefix}Shared message`;
            }
          } else {
            previewText = st.rollNo && !st.rollNo.includes('@') ? `#${st.rollNo} • Tap to chat` : 'Tap to chat';
          }

          return (
            <button
              key={st.id}
              onClick={() => handleSelectStudent(st.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition cursor-pointer group ${
                isSelected
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-200 shadow-glow-purple'
                  : 'text-slate-600 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* User Avatar + Green/Red Online Status Indicator */}
                <div
                  onClick={(e) => {
                    if (onOpenProfile) {
                      e.stopPropagation();
                      onOpenProfile(st);
                    }
                  }}
                  className="relative flex-shrink-0 cursor-pointer p-[1px] rounded-full hover:ring-2 hover:ring-indigo-500 transition"
                  title={`View ${st.name}'s Profile (${isOnline ? 'Online' : 'Offline'})`}
                >
                  <img
                    src={getSafeAvatar(st.avatar, st.name)}
                    alt={st.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-card-muted"
                  />
                  {/* Status Indicator Dot: Green if Online, Red if Offline */}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#121214] transition-colors ${
                      isOnline
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                        : 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]'
                    }`}
                    title={isOnline ? 'Online now' : 'Offline'}
                  />
                </div>

                {/* Conversation Details */}
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`truncate text-xs ${hasUnread ? 'font-bold text-slate-950 dark:text-white' : 'font-semibold text-slate-900 dark:text-zinc-200'}`}>
                        {st.nickname?.trim() || (st.name?.includes('@') ? st.name.split('@')[0] : st.name)}
                      </span>
                      {(st.role === 'admin' || st.id === classroom.adminId) && (
                        <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex-shrink-0">
                          👑 CR
                        </span>
                      )}
                    </div>

                    {/* Timestamp of last message */}
                    {lastMsg && (
                      <span className={`text-[10px] flex-shrink-0 font-medium ${hasUnread ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 dark:text-zinc-500'}`}>
                        {lastMsg.timestamp}
                      </span>
                    )}
                  </div>

                  {/* Message snippet & unread count badge */}
                  <div className="flex items-center justify-between gap-1.5 mt-0.5">
                    <p className={`text-[11px] truncate leading-tight flex-1 ${hasUnread ? 'font-semibold text-slate-900 dark:text-zinc-100' : 'text-slate-400 dark:text-zinc-400'}`}>
                      {previewText}
                    </p>

                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-indigo-600 text-white flex-shrink-0 shadow-xs animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
};
