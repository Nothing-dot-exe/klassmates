'use client';

import React from 'react';
import { X, Check, Image as ImageIcon } from 'lucide-react';
import { CHAT_BACKGROUNDS, getThemedBackgroundStyle } from './chatBackgrounds';
import { useTheme } from '@/hooks/useTheme';

interface ChatWallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBgId: string;
  onSelectBg: (bgId: string) => void;
}

export const ChatWallpaperModal: React.FC<ChatWallpaperModalProps> = ({
  isOpen,
  onClose,
  currentBgId,
  onSelectBg,
}) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-zinc-200 dark:border-card-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-zinc-950/20 dark:shadow-black/70 flex flex-col max-h-[88dvh] transition-colors">
        {/* Simple Clean Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-card-border bg-card">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-[#24302c] text-zinc-900 dark:text-indigo-400 border border-zinc-200 dark:border-card-border">
              <ImageIcon className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                Chat Wallpaper
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Choose a background style for your chat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-[#24302c] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wallpaper 2-Column Responsive Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 grid grid-cols-2 gap-2.5 sm:gap-3 no-scrollbar">
          {CHAT_BACKGROUNDS.map((bg) => {
            const isSelected = bg.id === currentBgId;
            return (
              <button
                key={bg.id}
                type="button"
                onClick={() => {
                  onSelectBg(bg.id);
                }}
                className={`group relative flex flex-col text-left p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/10 dark:bg-[#1e1e24] ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-zinc-200 dark:border-card-border hover:border-indigo-400 dark:hover:border-indigo-500/60 bg-card-muted shadow-xs'
                }`}
              >
                {/* Visual miniature preview box */}
                <div
                  style={getThemedBackgroundStyle(bg.id, isDark)}
                  className="h-20 sm:h-24 w-full rounded-xl border border-zinc-200/80 dark:border-card-border mb-2 shadow-inner relative flex items-center justify-center transition-all overflow-hidden shrink-0"
                >
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="text-xs font-bold text-zinc-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                    {bg.name}
                  </span>
                  {isSelected && (
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-200 dark:border-indigo-800/40 uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1 sm:line-clamp-2 leading-tight">
                  {bg.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-card-border bg-zinc-50 dark:bg-card-muted flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-[11px]">Saved to your browser</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold transition cursor-pointer shadow-glow-purple active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

