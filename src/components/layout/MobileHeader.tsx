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
    <div className="md:hidden h-12 flex-shrink-0 w-full bg-white dark:bg-[#181818] border-b border-zinc-200 dark:border-[#2d2d2d] z-30 px-2.5 sm:px-3.5 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-zinc-700 dark:text-[#cccccc] hover:text-black dark:hover:text-white rounded-xl bg-zinc-50 dark:bg-[#252526] border border-zinc-200 dark:border-[#3c3c3c] transition active:scale-95 cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {currentUser && onOpenProfile && (
          <button
            onClick={() => onOpenProfile(currentUser)}
            className="p-[1.5px] rounded-full hover:ring-2 hover:ring-black dark:hover:ring-white flex-shrink-0 cursor-pointer transition"
            title="My Profile"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-[#252526] border border-zinc-200 dark:border-[#3c3c3c] object-cover"
            />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center min-w-0 px-2 text-center">
        <span className="font-extrabold text-xs tracking-tight text-zinc-950 dark:text-white truncate max-w-[120px] sm:max-w-[160px]">
          {classroom.name}
        </span>
        {adminUser && (
          <button
            onClick={() => onOpenProfile && onOpenProfile(adminUser)}
            className="text-[9px] text-zinc-600 dark:text-[#858585] font-medium truncate max-w-[120px] sm:max-w-[160px] flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            👑 CR: {adminUser.name?.includes('@') ? adminUser.name.split('@')[0] : adminUser.name}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <ThemeToggle className="p-1" />
        <button
          onClick={onSignOut}
          className="p-1 rounded-lg text-zinc-500 dark:text-[#858585] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition active:scale-95 cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
