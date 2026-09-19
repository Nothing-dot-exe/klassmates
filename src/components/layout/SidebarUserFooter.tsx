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
    <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0E1424] transition-colors">
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-[#10172A] border border-slate-200 dark:border-slate-800/80 gap-2 shadow-sm">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition text-left cursor-pointer group"
          title="Open My Profile & Settings"
        >
          <div className="relative flex-shrink-0">
            <img
              src={getSafeAvatar(currentUser.avatar, displayName)}
              alt={displayName}
              className="w-9 h-9 rounded-xl object-cover bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#10172A]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition truncate max-w-[100px]">
                {displayName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              {cleanRollNo && (
                <span
                  className="font-mono text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-indigo-200 dark:border-slate-700 truncate max-w-[75px] flex-shrink-0"
                  title={cleanRollNo}
                >
                  #{cleanRollNo}
                </span>
              )}
              <span
                className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.2 rounded-full whitespace-nowrap flex items-center gap-1 flex-shrink-0 ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-glow-gold'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40'
                }`}
              >
                {currentUser.role === 'admin' ? '👑 Class Rep' : '🎓 Student'}
              </span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <ThemeToggle className="p-1 text-slate-500 dark:text-slate-400 hover:text-amber-500" />
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
              title="Account & Privacy Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition active:scale-95 cursor-pointer"
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
