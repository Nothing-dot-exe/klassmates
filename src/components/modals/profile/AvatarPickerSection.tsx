'use client';

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, RotateCcw } from 'lucide-react';
import { User } from '@/types';
import { getSafeAvatar } from '@/lib/avatarUtils';

const PRESET_GIFS_AND_AVATARS = [
  { label: 'Vibing Cat GIF', url: 'https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif' },
  { label: 'Lofi Cat GIF', url: 'https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif' },
  { label: 'Pixel Chill GIF', url: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' },
  { label: 'Dancing Duck GIF', url: 'https://media.giphy.com/media/kFgzrTt798d2w/giphy.gif' },
  { label: 'Cool Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CoolBot' },
  { label: 'Pixel Gamer', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=GamerPro' },
];

interface AvatarPickerSectionProps {
  avatar: string;
  setAvatar: (url: string) => void;
  name: string;
  currentUser: User;
}

export const AvatarPickerSection: React.FC<AvatarPickerSectionProps> = ({
  avatar,
  setAvatar,
  name,
  currentUser,
}) => {
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      setFileError('File exceeds 2.5MB. Please choose a smaller image or GIF.');
      return;
    }

    setFileError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (customUrlInput.trim()) {
      setAvatar(customUrlInput.trim());
      setCustomUrlInput('');
    }
  };

  const handleResetAvatar = () => {
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
      currentUser.name || 'Student'
    )}`;
    setAvatar(defaultAvatar);
  };

  const previewAvatar = avatar || getSafeAvatar(currentUser.avatar, name || currentUser.name);
  const isGif = previewAvatar.includes('.gif') || previewAvatar.includes('data:image/gif');

  return (
    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Profile Photo or GIF</span>
        </label>
        {isGif && (
          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 animate-pulse">
            Animated GIF ✨
          </span>
        )}
      </div>

      <div className="flex items-center gap-3.5">
        {/* Avatar Preview */}
        <div className="relative flex-shrink-0 p-[2px] rounded-full border border-zinc-300 dark:border-[#27272a] shadow-2xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewAvatar}
            alt="Avatar Preview"
            className="w-16 h-16 rounded-full object-cover bg-zinc-100 dark:bg-[#222226] ring-2 ring-white dark:ring-[#121214]"
          />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.gif"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-950/20 transition active:scale-95 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo / GIF</span>
            </button>

            <button
              type="button"
              onClick={handleResetAvatar}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#222226] hover:bg-zinc-100 dark:hover:bg-[#1c2744] border border-zinc-200 dark:border-[#27272a] text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white text-xs font-medium flex items-center gap-1 transition cursor-pointer"
              title="Reset to default avatar"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {fileError && (
            <p className="text-[10px] text-rose-600 font-medium">{fileError}</p>
          )}
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
            Supports animated GIFs, PNG, JPG, or SVG up to 2.5MB.
          </p>
        </div>
      </div>

      {/* Quick GIF & Avatar Presets */}
      <div className="pt-2 border-t border-zinc-200 dark:border-[#27272a] space-y-1.5">
        <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Pick a Quick Animated GIF / Avatar:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_GIFS_AND_AVATARS.map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => setAvatar(preset.url)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                avatar === preset.url
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-xs'
                  : 'bg-white dark:bg-[#222226] border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#1c2744]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Paste GIF / Image URL */}
      <div className="flex gap-1.5 pt-1">
        <input
          type="url"
          value={customUrlInput}
          onChange={(e) => setCustomUrlInput(e.target.value)}
          placeholder="Or paste image / GIF link (https://...)"
          className="flex-1 bg-white dark:bg-[#222226] border border-zinc-200 dark:border-[#27272a] rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={handleApplyUrl}
          className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-[#222226] hover:bg-zinc-200 dark:hover:bg-[#1c2744] border border-zinc-200 dark:border-[#27272a] text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition cursor-pointer"
        >
          Apply
        </button>
      </div>
    </div>
  );
};
