'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer select-none active:scale-95 ${
        isDark
          ? 'bg-[#252526] hover:bg-[#2d2d2d] text-[#cccccc] hover:text-white border-[#3c3c3c] shadow-xs'
          : 'bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border-zinc-200 shadow-2xs'
      } ${className}`}
      title={isDark ? 'Switch to Day Mode (Light)' : 'Switch to VS Code Dark Mode'}
      aria-label={isDark ? 'Switch to Day Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in fade-in zoom-in duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-700 animate-in fade-in zoom-in duration-200" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? 'Day Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
