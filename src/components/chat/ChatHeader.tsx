'use client';

import { Hash, Phone, Trash2, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { Channel, User } from '@/types';
import { getSafeAvatar } from '@/lib/avatarUtils';

interface ChatHeaderProps {
  currentChannel?: Channel;
  currentRecipient?: User;
  adminUser?: User;
  title: string;
  subtitle: string;
  typingUser?: { userName: string; userAvatar?: string } | null;
  onOpenProfileById?: (userId: string) => void;
  onOpenClearChat: () => void;
  onOpenWallpaper?: () => void;
  onBack?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentChannel,
  currentRecipient,
  adminUser,
  title,
  subtitle,
  typingUser,
  onOpenProfileById,
  onOpenClearChat,
  onOpenWallpaper,
  onBack,
}) => {
  return (
    <div className="h-14 sm:h-16 border-b border-card-border bg-card/95 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between flex-shrink-0 transition-colors">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-card-muted text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-zinc-800 transition active:scale-95 cursor-pointer flex-shrink-0"
            title="Back to Channels"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        {currentRecipient ? (
          <button
            type="button"
            onClick={() => onOpenProfileById?.(currentRecipient.id)}
            className="p-[1.5px] rounded-full border border-slate-200 dark:border-zinc-700 hover:scale-105 transition active:scale-95 flex-shrink-0 cursor-pointer"
            title={`View ${currentRecipient.name}'s Profile`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getSafeAvatar(currentRecipient.avatar, currentRecipient.name)}
              alt={currentRecipient.name}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover bg-slate-100 dark:bg-card-muted"
            />
          </button>
        ) : (
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-card-muted text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700/60 flex-shrink-0">
            <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {currentRecipient ? (
              <button
                type="button"
                onClick={() => onOpenProfileById?.(currentRecipient.id)}
                className="text-xs sm:text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline truncate text-left flex items-center gap-1.5"
              >
                <span>{title}</span>
                {currentRecipient.nickname?.trim() && currentRecipient.nickname.trim() !== currentRecipient.name.trim() && (
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-normal">({currentRecipient.name})</span>
                )}
              </button>
            ) : (
              <h2 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white truncate font-display">{title}</h2>
            )}

            {currentRecipient && (
              currentRecipient.role === 'admin' || (adminUser && currentRecipient.id === adminUser.id) ? (
                <span className="text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded flex-shrink-0">
                  👑 CR
                </span>
              ) : currentRecipient.rollNo && !currentRecipient.rollNo.includes('@') ? (
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-card-muted text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/60 px-1.5 py-0.5 rounded flex-shrink-0">
                  {currentRecipient.rollNo}
                </span>
              ) : null
            )}
          </div>

          {typingUser ? (
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              <span>{typingUser.userName} is typing...</span>
            </div>
          ) : currentRecipient ? (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  currentRecipient.status === 'online'
                    ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                    : 'bg-zinc-400 dark:bg-zinc-500'
                }`}
              />
              <span className="capitalize font-medium">
                {currentRecipient.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          ) : currentChannel ? (
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
              {currentChannel.description || 'Classroom channel'}
            </p>
          ) : subtitle ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {/* Header Right: Channel Admin / Spotify / Wallpaper / Clear Chat / Theme Toggle */}
      <div className="flex items-center gap-2">
        {currentChannel && adminUser && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-card-muted border border-slate-200 dark:border-zinc-700/60 text-[11px] text-slate-700 dark:text-zinc-300">
            <span className="font-bold text-slate-900 dark:text-white">👑 CR:</span>
            <span className="text-slate-800 dark:text-zinc-200 font-semibold">{adminUser.name}</span>
            {adminUser.phone && (
              <a
                href={`tel:${adminUser.phone}`}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-mono text-[10px]"
                title="Call Class Representative"
              >
                <Phone className="w-3 h-3" />
                <span>{adminUser.phone}</span>
              </a>
            )}
          </div>
        )}



        <button
          type="button"
          onClick={onOpenWallpaper}
          className="min-h-8 min-w-8 flex items-center justify-center p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          title="Change Chat Wallpaper & Background"
          aria-label="Change Wallpaper"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenClearChat}
          className="min-h-8 min-w-8 flex items-center justify-center p-1.5 rounded-xl text-slate-400 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
          title="Clear Chat History (with Backup)"
          aria-label="Clear Chat History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
