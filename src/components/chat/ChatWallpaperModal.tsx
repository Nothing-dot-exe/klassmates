'use client';

import React from 'react';
import { X, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { CHAT_BACKGROUNDS, ChatBackgroundOption } from './chatBackgrounds';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-zinc-950/10 flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-1.5">
                <span>Chat Wallpaper & Atmosphere</span>
                <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
              </h3>
              <p className="text-[11px] text-zinc-500">
                Choose a custom background aesthetic for your classroom chat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wallpaper Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 no-scrollbar">
          {CHAT_BACKGROUNDS.map((bg) => {
            const isSelected = bg.id === currentBgId;
            return (
              <button
                key={bg.id}
                type="button"
                onClick={() => {
                  onSelectBg(bg.id);
                }}
                className={`group relative text-left p-3.5 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-black bg-zinc-50 ring-2 ring-black/10'
                    : 'border-zinc-200 hover:border-zinc-400 bg-white shadow-xs'
                }`}
              >
                {/* Visual miniature preview box */}
                <div
                  style={bg.containerStyle}
                  className="h-20 w-full rounded-xl border border-zinc-200 mb-2.5 shadow-inner relative overflow-hidden flex items-center justify-center"
                >
                  {isSelected && (
                    <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-zinc-950 group-hover:text-black transition">
                    {bg.name}
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-[10.5px] text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {bg.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <span>Saved to your personal browser settings</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
