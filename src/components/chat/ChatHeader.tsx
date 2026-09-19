'use client';

import { Hash, Phone, Trash2, Image as ImageIcon } from 'lucide-react';
import { Channel, User } from '@/types';
import { getSafeAvatar } from '@/lib/avatarUtils';
import { ThemeToggle } from '@/components/common/ThemeToggle';

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
}) => {
  return (
    <div className="h-14 sm:h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0B0E17]/95 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between flex-shrink-0 transition-colors">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        {currentRecipient ? (
          <button
            type="button"
            onClick={() => onOpenProfileById?.(currentRecipient.id)}
            className="p-[1.5px] rounded-full border border-slate-200 dark:border-slate-700 hover:scale-105 transition active:scale-95 flex-shrink-0 cursor-pointer"
            title={`View ${currentRecipient.name}'s Profile`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getSafeAvatar(currentRecipient.avatar, currentRecipient.name)}
              alt={currentRecipient.name}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover bg-slate-100 dark:bg-[#182032]"
            />
          </button>
        ) : (
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#182032] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 flex-shrink-0">
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
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">({currentRecipient.name})</span>
                )}
              </button>
            ) : (
              <h2 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white truncate font-display">{title}</h2>
            )}

            {currentRecipient && currentRecipient.rollNo && (
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-[#182032] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 px-1.5 py-0.5 rounded flex-shrink-0">
                {currentRecipient.rollNo}
              </span>
            )}
          </div>

          {typingUser ? (
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              <span>{typingUser.userName} is typing...</span>
            </div>
          ) : currentRecipient ? (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  currentRecipient.status === 'studying'
                    ? 'bg-slate-500 dark:bg-slate-400'
                    : currentRecipient.status === 'online'
                    ? 'bg-emerald-500'
                    : 'bg-slate-400'
                }`}
              />
              <span className="capitalize">{currentRecipient.status || 'Active'}</span>
              <span>•</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">Private Direct Chat</span>
            </div>
          ) : currentChannel ? (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Official Classroom Discussion • Visible to all enrolled classmates
            </p>
          ) : subtitle ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {/* Header Right: Channel Admin / Spotify / Wallpaper / Clear Chat / Theme Toggle */}
      <div className="flex items-center gap-2">
        {currentChannel && adminUser && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#182032] border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">👑 CR:</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">{adminUser.name}</span>
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
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Change Chat Wallpaper & Background"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenClearChat}
          className="p-1.5 rounded-xl text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
          title="Clear Chat History (with Backup)"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </div>
  );
};
