import React from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Classroom, User } from '@/types';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { getSafeAvatar } from '@/lib/avatarUtils';

interface MobileHeaderProps {
  classroom: Classroom;
  adminUser: User | null;
  currentUser?: User;
  isMobileSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSignOut: () => void;
  onOpenProfile?: (user: User) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  classroom,
  adminUser,
  currentUser,
  isMobileSidebarOpen,
  onToggleSidebar,
  onSignOut,
  onOpenProfile,
}) => {
  return (
    <div className="md:hidden h-14 flex-shrink-0 w-full bg-white/95 dark:bg-[#121214]/95 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800/80 z-30 px-3 flex items-center justify-between transition-colors shadow-xs">
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 transition active:scale-95 cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Live status dot */}
        <span className="relative flex h-2 w-2" title="Classroom Live">
          <span className="pulse-dot-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      <div className="flex flex-col items-center min-w-0 px-2 text-center">
        <span className="font-extrabold text-xs tracking-tight text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[200px]">
          {classroom.name}
        </span>
        {(classroom.section || classroom.institution) && (
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate max-w-[140px] sm:max-w-[200px]">
            {classroom.section ? `${classroom.section}${classroom.semester ? ` • Sem ${classroom.semester}` : ''}` : classroom.institution}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <ThemeToggle className="p-1 text-slate-500 dark:text-zinc-400" />
        {currentUser && onOpenProfile && (
          <button
            onClick={() => onOpenProfile(currentUser)}
            className="p-[1.5px] rounded-full hover:ring-2 hover:ring-indigo-500 flex-shrink-0 cursor-pointer transition"
            title="My Profile"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getSafeAvatar(currentUser.avatar, currentUser.name)}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 object-cover"
            />
          </button>
        )}
        <button
          onClick={onSignOut}
          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition active:scale-95 cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
