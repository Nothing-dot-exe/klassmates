'use client';

import React from 'react';
import { Phone, Mail, MessageSquare, Crown } from 'lucide-react';
import { User } from '@/types';
import { getSafeAvatar } from '@/lib/avatarUtils';

interface ClassRepBannerProps {
  admin: User;
  currentUserId: string;
  onSelectDm: (userId: string) => void;
}

export const ClassRepBanner: React.FC<ClassRepBannerProps> = ({
  admin,
  currentUserId,
  onSelectDm,
}) => {
  const isMe = admin.id === currentUserId;
  const crName = admin.nickname?.trim() || admin.name;

  return (
    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-[#252526] border border-zinc-200 dark:border-[#2d2d2d] shadow-xs space-y-2 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 text-zinc-900 dark:text-amber-400" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-800 dark:text-[#cccccc]">
            Class Representative
          </span>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#1e1e1e] text-zinc-900 dark:text-[#cccccc] border border-zinc-200 dark:border-[#3c3c3c] flex items-center gap-1 shadow-xs">
          👑 {isMe ? 'You (CR)' : 'CR / Admin'}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getSafeAvatar(admin.avatar, admin.name)}
          alt={admin.name}
          className="w-8 h-8 rounded-xl object-cover ring-1 ring-zinc-300 dark:ring-[#3c3c3c] bg-white dark:bg-[#1e1e1e] flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-zinc-950 dark:text-white truncate">{crName}</div>
          <div className="text-[10px] text-zinc-500 dark:text-[#858585] truncate font-medium">
            {admin.designation || 'Class Representative & Student Admin'}
          </div>
        </div>
      </div>

      {/* Direct unmasked contact shown to classmates */}
      <div className="pt-2 border-t border-zinc-200 dark:border-[#2d2d2d] space-y-1 text-[11px]">
        {admin.phone && (
          <a
            href={`tel:${admin.phone}`}
            className="flex items-center gap-2 text-zinc-700 dark:text-[#cccccc] hover:text-black dark:hover:text-white transition group"
            title="Call or WhatsApp Class Representative"
          >
            <Phone className="w-3.5 h-3.5 text-zinc-600 dark:text-[#858585] flex-shrink-0" />
            <span className="font-mono text-xs text-zinc-900 dark:text-white group-hover:underline">{admin.phone}</span>
          </a>
        )}
        {admin.email && (
          <a
            href={`mailto:${admin.email}`}
            className="flex items-center gap-2 text-zinc-700 dark:text-[#cccccc] hover:text-black dark:hover:text-white transition truncate group"
            title="Email Class Representative"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-600 dark:text-[#858585] flex-shrink-0" />
            <span className="truncate text-xs text-zinc-900 dark:text-white group-hover:underline">{admin.email}</span>
          </a>
        )}
      </div>

      {currentUserId !== admin.id && (
        <div className="pt-2">
          <button
            onClick={() => onSelectDm(admin.id)}
            className="w-full py-1.5 px-3 rounded-xl bg-black dark:bg-[#0e639c] hover:bg-zinc-800 dark:hover:bg-[#1177bb] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message Class Rep</span>
          </button>
        </div>
      )}
    </div>
  );
};
