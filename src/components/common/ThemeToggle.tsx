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
          ? 'bg-card-muted hover:bg-[#24302c] text-[#e8e4dc] hover:text-white border-card-border'
          : 'bg-card hover:bg-card-muted text-stone-700 hover:text-stone-950 border-card-border'
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
