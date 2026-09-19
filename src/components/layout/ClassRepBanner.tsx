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
    <div className="relative rounded-2xl bg-gradient-to-b from-slate-100 to-white dark:from-[#222226] dark:to-[#0E1528] border border-amber-500/25 p-3.5 shadow-xl shadow-black/20 dark:shadow-black/40 overflow-hidden transition-colors">
      {/* Decorative amber corner glow from Stitch */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Header: Title & Badges */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-zinc-800/80 relative z-10">
        <div className="flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400/20" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
            Class Representative
          </span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-bold text-[10px]">
          <span>👑</span>
          <span>{isMe ? 'You (CR)' : 'CR'}</span>
        </div>
      </div>

      {/* Representative Identity (Avatar & Name) */}
      <div className="flex items-center gap-3 mb-3 relative z-10">
        {/* Custom CR Mascot Avatar Frame with Stitch Amber Gradient */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[1.5px] shadow-glow-gold flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#0E1528] flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getSafeAvatar(admin.avatar, admin.name)}
                alt={admin.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0E1528] rounded-full" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-slate-900 dark:text-white text-xs tracking-tight capitalize truncate">
            {crName}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">
            {admin.designation || 'Class Representative (CR)'}
          </p>
        </div>
      </div>

      {/* Direct Contact Quick-Actions from Stitch */}
      <div className="grid grid-cols-1 gap-1.5 pt-0.5 relative z-10">
        {admin.phone && (
          <a
            href={`tel:${admin.phone}`}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-white/80 dark:bg-zinc-900/60 hover:bg-slate-100 dark:hover:bg-zinc-800/80 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white transition-all group shadow-2xs"
            title="Call Class Representative"
          >
            <span className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-500/25 transition-colors flex-shrink-0">
              <Phone className="w-3 h-3" />
            </span>
            <span className="text-[11px] font-mono font-medium tracking-wide text-slate-900 dark:text-zinc-200 truncate">
              {admin.phone}
            </span>
          </a>
        )}

        {admin.email && (
          <a
            href={`mailto:${admin.email}`}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-white/80 dark:bg-zinc-900/60 hover:bg-slate-100 dark:hover:bg-zinc-800/80 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white transition-all group shadow-2xs"
            title="Email Class Representative"
          >
            <span className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-500/25 transition-colors flex-shrink-0">
              <Mail className="w-3 h-3" />
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-900 dark:text-zinc-200 truncate">
              {admin.email}
            </span>
          </a>
        )}
      </div>

      {currentUserId !== admin.id && (
        <div className="pt-2 relative z-10">
          <button
            onClick={() => onSelectDm(admin.id)}
            className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-glow-purple cursor-pointer active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message Class Rep</span>
          </button>
        </div>
      )}
    </div>
  );
};
