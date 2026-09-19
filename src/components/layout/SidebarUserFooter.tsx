import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { User } from '@/types';
import { getSafeAvatar } from '@/lib/avatarUtils';

import { ThemeToggle } from '@/components/common/ThemeToggle';

interface SidebarUserFooterProps {
  currentUser: User;
  onOpenSettings?: () => void;
  onSignOut?: () => void;
}

export const SidebarUserFooter: React.FC<SidebarUserFooterProps> = ({
  currentUser,
  onOpenSettings,
  onSignOut,
}) => {
  const isEmailRollNo = currentUser.rollNo?.includes('@');
  const cleanRollNo = isEmailRollNo ? null : currentUser.rollNo;
  const displayName = currentUser.nickname?.trim()
    ? currentUser.nickname.trim()
    : currentUser.name?.includes('@')
      ? currentUser.name.split('@')[0]
      : (currentUser.name || 'User');

  return (
    <div className="p-3 border-t border-zinc-200 dark:border-[#2d2d2d] bg-white dark:bg-[#181818] transition-colors">
      <div className="flex items-center justify-between p-2 rounded-2xl bg-zinc-50 dark:bg-[#252526] border border-zinc-200 dark:border-[#2d2d2d] gap-2">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-85 transition text-left cursor-pointer group"
          title="Open My Profile & Settings"
        >
          <div className="relative flex-shrink-0 p-[1px] rounded-full hover:ring-2 hover:ring-black dark:hover:ring-[#007acc] transition">
            <img
              src={getSafeAvatar(currentUser.avatar, displayName)}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover bg-zinc-200 dark:bg-[#3c3c3c] ring-1 ring-zinc-200 dark:ring-[#3c3c3c]"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#252526]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-950 dark:text-white group-hover:text-black dark:group-hover:text-white transition truncate max-w-[100px]">
                {displayName}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-wrap mt-0.5">
              {cleanRollNo && (
                <span
                  className="font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700/60 truncate max-w-[75px] flex-shrink-0"
                  title={cleanRollNo}
                >
                  #{cleanRollNo}
                </span>
              )}
              <span
                className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 flex-shrink-0 ${currentUser.role === 'admin'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40'
                  }`}
              >
                {currentUser.role === 'admin' ? '👑 Class Rep' : '🎓 Student'}
              </span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <ThemeToggle className="p-1" />
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 rounded-xl text-zinc-500 dark:text-[#858585] hover:text-black dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-[#3c3c3c] border border-transparent transition active:scale-95 cursor-pointer"
              title="Account & Privacy Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="p-1.5 rounded-xl text-zinc-500 dark:text-[#858585] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent transition active:scale-95 cursor-pointer"
              title="Sign Out or Switch Account"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
