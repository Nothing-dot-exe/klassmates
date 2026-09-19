import React from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Classroom, User } from '@/types';
import { ThemeToggle } from '@/components/common/ThemeToggle';

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
    <div className="md:hidden h-14 flex-shrink-0 w-full bg-white/95 dark:bg-[#0E1424]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 z-30 px-3 flex items-center justify-between transition-colors shadow-xs">
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-[#121A2D] border border-slate-200 dark:border-slate-800 transition active:scale-95 cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Stitch Brand Monogram */}
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 p-[1px] shadow-glow-purple flex items-center justify-center">
          <div className="w-full h-full bg-white dark:bg-[#0E1424] rounded-[7px] flex items-center justify-center">
            <span className="font-black text-xs bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-300 dark:to-white bg-clip-text text-transparent">m</span>
          </div>
        </div>

        {/* Live status dot */}
        <span className="relative flex h-2 w-2">
          <span className="pulse-dot-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      <div className="flex flex-col items-center min-w-0 px-2 text-center">
        <span className="font-extrabold text-xs tracking-tight text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-[180px]">
          {classroom.name}
        </span>
        {adminUser && (
          <button
            onClick={() => onOpenProfile && onOpenProfile(adminUser)}
            className="text-[9.5px] text-amber-600 dark:text-amber-400 font-bold truncate max-w-[130px] sm:max-w-[180px] flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            👑 CR: {adminUser.name?.includes('@') ? adminUser.name.split('@')[0] : adminUser.name}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <ThemeToggle className="p-1 text-slate-500 dark:text-slate-400" />
        {currentUser && onOpenProfile && (
          <button
            onClick={() => onOpenProfile(currentUser)}
            className="p-[1.5px] rounded-full hover:ring-2 hover:ring-indigo-500 flex-shrink-0 cursor-pointer transition"
            title="My Profile"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 object-cover"
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
