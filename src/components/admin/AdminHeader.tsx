import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Radio,
  Clock,
  Copy,
  Check,
  UserPlus,
  SlidersHorizontal,
  QrCode,
  KeyRound,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Pin,
} from 'lucide-react';
import { Classroom, User, PendingRequest, PasswordResetRequest } from '@/types';

export type AdminTab = 'roster' | 'pending' | 'add' | 'settings' | 'share';

interface AdminHeaderProps {
  classroom: Classroom;
  students: User[];
  pendingRequests: PendingRequest[];
  passwordResetRequests: PasswordResetRequest[];
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  copiedCode: boolean;
  onCopyCode: () => void;
  onBack?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  classroom,
  students,
  pendingRequests,
  passwordResetRequests,
  activeTab,
  setActiveTab,
  copiedCode,
  onCopyCode,
  onBack,
}) => {
  const onlineCount = students.filter((s) => s.status === 'online' || s.status === 'studying').length;
  const pendingCount = pendingRequests.length + passwordResetRequests.length;
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Pin feature state persisted in localStorage
  const [pinnedTab, setPinnedTab] = useState<AdminTab | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        return (localStorage.getItem('classmate_pinned_admin_tab') as AdminTab) || null;
      } catch {}
    }
    return null;
  });

  const handleTogglePin = (tabId: AdminTab, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedTab((prev) => {
      const next = prev === tabId ? null : tabId;
      try {
        if (next) {
          localStorage.setItem('classmate_pinned_admin_tab', next);
        } else {
          localStorage.removeItem('classmate_pinned_admin_tab');
        }
      } catch {}
      return next;
    });

    // Smoothly scroll to front to see pinned tab
    if (tabsRef.current) {
      setTimeout(() => {
        tabsRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
      }, 50);
    }
  };

  const checkScroll = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = tabsRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, students.length, pendingCount, pinnedTab]);

  // Scroll left/right buttons handler
  const handleScroll = (direction: 'left' | 'right') => {
    const el = tabsRef.current;
    if (!el) return;
    const scrollAmount = Math.max(140, Math.floor(el.clientWidth * 0.6));
    el.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
  };

  // Convert vertical mouse wheel to horizontal scroll seamlessly
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = tabsRef.current;
    if (!el) return;
    if (e.deltaY !== 0) {
      el.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  // Drag-to-scroll for mouse users
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tabsRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !tabsRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    tabsRef.current.scrollLeft = scrollLeftState - walk;
    checkScroll();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTabClick = (id: AdminTab, e: React.MouseEvent<HTMLButtonElement>) => {
    setActiveTab(id);
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const baseTabs = useMemo(
    () => [
      {
        id: 'roster' as const,
        label: 'Classmates',
        icon: Users,
        badge: (
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'roster'
                ? 'bg-zinc-800 dark:bg-[#007acc] text-white'
                : 'bg-zinc-200 dark:bg-[#3c3c3c] text-zinc-800 dark:text-[#cccccc]'
            }`}
          >
            {students.length}
          </span>
        ),
      },
      {
        id: 'pending' as const,
        label: 'Requests',
        icon: Clock,
        badge:
          pendingCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
              {pendingCount}
            </span>
          ) : null,
      },
      { id: 'add' as const, label: 'Add Students', icon: UserPlus },
      { id: 'settings' as const, label: 'Settings', icon: SlidersHorizontal },
      { id: 'share' as const, label: 'Share & QR', icon: QrCode },
    ],
    [activeTab, students.length, pendingCount]
  );

  // If a tab is pinned, move it to the very first position
  const tabs = useMemo(() => {
    if (!pinnedTab) return baseTabs;
    const pinnedItem = baseTabs.find((t) => t.id === pinnedTab);
    if (!pinnedItem) return baseTabs;
    return [pinnedItem, ...baseTabs.filter((t) => t.id !== pinnedTab)];
  }, [pinnedTab, baseTabs]);

  return (
    <div className="border-b border-card-border bg-card/95 backdrop-blur-xl relative sm:sticky sm:top-0 z-20 transition-colors">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-5 space-y-3 sm:space-y-4">
        {/* Top Identity Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-card-muted text-slate-700 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-zinc-800 transition active:scale-95 cursor-pointer shrink-0"
                title="Back to Classroom"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-white font-display text-sm sm:text-lg shadow-glow-teal shrink-0">
              {classroom.name ? classroom.name.slice(0, 1).toUpperCase() : 'C'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-lg text-slate-900 dark:text-white tracking-tight truncate">
                  {classroom.name || 'Classroom Admin'}
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-indigo-50 dark:bg-[#24302c] text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 shrink-0">
                  Admin Panel
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                {classroom.institution && <span className="truncate">{classroom.institution}</span>}
                {classroom.section && <span>• {classroom.section}{classroom.semester ? ` (Sem ${classroom.semester})` : ''}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stat & Action Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
          {/* Card 1: Enrolled */}
          <div
            onClick={() => setActiveTab('roster')}
            className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-card hover:bg-slate-50 dark:hover:bg-[#1f2c28] border border-slate-200 dark:border-zinc-800/80 transition duration-200 cursor-pointer flex items-center gap-2.5 group shadow-xs"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-2xl font-black text-slate-900 dark:text-white leading-none">{students.length}</div>
              <div className="text-[10px] sm:text-xs text-slate-700 dark:text-zinc-300 font-bold mt-1 truncate">Students</div>
              <div className="text-[9.5px] text-slate-500 dark:text-zinc-400 font-semibold truncate hidden sm:block">View Class Roster</div>
            </div>
          </div>

          {/* Card 2: Active Online */}
          <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-slate-200 dark:border-zinc-800/80 flex items-center gap-2.5 group shadow-xs">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-2xl font-black text-slate-900 dark:text-white leading-none flex items-center gap-1.5">
                <span>{onlineCount}</span>
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              </div>
              <div className="text-[10px] sm:text-xs text-slate-700 dark:text-zinc-300 font-bold mt-1 truncate">Online</div>
              <div className="text-[9.5px] text-slate-500 dark:text-zinc-400 font-semibold truncate hidden sm:block">Real-Time Presence</div>
            </div>
          </div>

          {/* Card 3: Pending Approvals */}
          <div
            onClick={() => setActiveTab('pending')}
            className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border transition duration-200 cursor-pointer flex items-center gap-2.5 group shadow-xs ${
              pendingCount > 0
                ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 hover:border-amber-400 shadow-glow-gold'
                : 'bg-card border-slate-200 dark:border-zinc-800/80 hover:bg-slate-50 dark:hover:bg-[#1f2c28]'
            }`}
          >
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                pendingCount > 0
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
              }`}
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-2xl font-black leading-none text-slate-900 dark:text-white">{pendingCount}</div>
              <div className="text-[10px] sm:text-xs text-slate-700 dark:text-zinc-300 font-bold mt-1 truncate">Pending</div>
              <div className="text-[9.5px] text-slate-500 dark:text-zinc-400 font-semibold truncate hidden sm:block">
                {pendingCount > 0 ? 'Action Required' : 'All Requests Cleared'}
              </div>
            </div>
          </div>

          {/* Card 4: Invite Code */}
          <div
            onClick={onCopyCode}
            className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-card hover:bg-slate-50 dark:hover:bg-[#1f2c28] border border-slate-200 dark:border-zinc-800/80 transition duration-200 cursor-pointer flex items-center justify-between gap-1.5 group shadow-xs"
            title="Click to copy Class Code"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-xs sm:text-base font-black text-indigo-600 dark:text-indigo-400 tracking-wide truncate">
                  {classroom.code}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-600 dark:text-zinc-400 font-bold truncate">Class Code</div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCopyCode();
              }}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition flex items-center justify-center shrink-0 cursor-pointer active:scale-95 ${
                copiedCode
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-glow-purple'
                  : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700'
              }`}
              title="Copy Class Invite Code"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation Segmented Bar Row with Horizontal Scroll & Pinning */}
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="relative flex items-center gap-1.5 min-w-0 max-w-full w-full sm:w-auto">
            {/* Scroll Left Button */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-zinc-300 dark:border-[#3c3c3c] bg-white dark:bg-[#252526] text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-[#3c3c3c] transition-all flex items-center justify-center shrink-0 cursor-pointer active:scale-95 shadow-xs z-10"
                title="Scroll left"
                aria-label="Scroll tabs left"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-900 dark:text-white" />
              </button>
            )}

            {/* Scrollable Tabs Track */}
            <div
              ref={tabsRef}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className={`inline-flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-card border border-slate-200 dark:border-zinc-800/80 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x min-w-0 flex-1 sm:flex-initial shadow-xs select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isPinned = pinnedTab === tab.id;

                return (
                  <div
                    key={tab.id}
                    className={`group relative flex items-center rounded-lg sm:rounded-xl transition shrink-0 select-none ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow-purple'
                        : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#24302c]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleTabClick(tab.id, e)}
                      className="pl-2.5 sm:pl-3.5 pr-1.5 py-1.5 sm:py-2 text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span>{tab.label}</span>
                      {tab.badge}
                    </button>

                    {/* Pin / Unpin Button */}
                    <button
                      type="button"
                      onClick={(e) => handleTogglePin(tab.id, e)}
                      className={`pr-2 sm:pr-2.5 py-1.5 pl-0.5 transition cursor-pointer flex items-center justify-center ${
                        isPinned
                          ? 'text-amber-400 dark:text-amber-400 opacity-100 scale-105'
                          : 'opacity-25 group-hover:opacity-100 hover:text-amber-400'
                      }`}
                      title={isPinned ? 'Pinned first (click to unpin)' : 'Pin tab first'}
                      aria-label={isPinned ? `Unpin ${tab.label}` : `Pin ${tab.label} first`}
                    >
                      <Pin className={`w-3 h-3 ${isPinned ? 'fill-amber-400 stroke-amber-400' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-slate-300 dark:border-zinc-800 bg-card-muted text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center shrink-0 cursor-pointer active:scale-95 shadow-xs z-10"
                title="Scroll right"
                aria-label="Scroll tabs right"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-900 dark:text-white" />
              </button>
            )}
          </div>

          {/* Desktop Right Side Balanced Companion */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card-muted border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 shrink-0 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            <span>Workspace:</span>
            <span className="text-slate-900 dark:text-white font-bold">{classroom.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
