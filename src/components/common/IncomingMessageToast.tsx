'use client';

import React, { useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { getSafeAvatar } from '@/lib/avatarUtils';

export interface IncomingNotificationData {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRollNo?: string;
  channelId?: string;
  content: string;
  timestamp: string;
}

interface IncomingMessageToastProps {
  notification: IncomingNotificationData | null;
  onDismiss: () => void;
  onOpenConversation: (notification: IncomingNotificationData) => void;
}

export const IncomingMessageToast: React.FC<IncomingMessageToastProps> = ({
  notification,
  onDismiss,
  onOpenConversation,
}) => {
  useEffect(() => {
    if (!notification) return;

    // Toast remains purely visual and silent without intrusive audio beeps
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const isDm = !notification.channelId;

  return (
    <div className="fixed top-4 right-3 sm:right-6 z-50 max-w-sm w-[calc(100vw-24px)] animate-in slide-in-from-top-3 fade-in duration-200">
      <div
        onClick={() => onOpenConversation(notification)}
        className="group relative flex items-start gap-3 p-3 bg-white/95 dark:bg-card-muted/95 border border-indigo-200/80 dark:border-indigo-500/30 rounded-2xl shadow-xl shadow-indigo-950/15 backdrop-blur-xl hover:border-indigo-400 dark:hover:border-indigo-400 transition cursor-pointer select-none"
      >
        {/* Sender Avatar with Green Online Glow */}
        <div className="relative flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getSafeAvatar(notification.senderAvatar, notification.senderName)}
            alt={notification.senderName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30 bg-slate-100 dark:bg-zinc-800"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#18181b] shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
        </div>

        {/* Notification Body */}
        <div className="min-w-0 flex-1 pr-6">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {notification.senderName}
            </span>
            {notification.senderRollNo && (
              <span className="text-[9px] font-mono text-slate-500 dark:text-zinc-400">
                #{notification.senderRollNo}
              </span>
            )}
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
              {isDm ? 'Direct Chat' : '#channel'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 mt-0.5 font-[450] leading-snug">
            {notification.content}
          </p>

          <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 inline-block font-mono">
            {notification.timestamp || 'Just now'} • Tap to reply
          </span>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
