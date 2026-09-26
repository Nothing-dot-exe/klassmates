import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { User } from '@/types';
import { getSafeAvatar } from '@/lib/avatarUtils';

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
    <div className="p-3 border-t border-card-border bg-card transition-colors">
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-card-muted border border-card-border gap-2 shadow-sm">
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
              className="w-9 h-9 rounded-xl object-cover bg-slate-200 dark:bg-zinc-800 border border-card-border"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition truncate">
                {displayName}
              </span>
              {cleanRollNo && (
                <span
                  className="font-mono text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-zinc-700 truncate shrink-0"
                  title={cleanRollNo}
                >
                  #{cleanRollNo}
                </span>
              )}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-zinc-800 transition active:scale-95 cursor-pointer"
              title="Account & Privacy Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="p-1.5 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition active:scale-95 cursor-pointer"
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
