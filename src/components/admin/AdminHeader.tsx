import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Users,
  Radio,
  Clock,
  Copy,
  Check,
  UserPlus,
  SlidersHorizontal,
  QrCode,
  ShieldCheck,
  Building2,
  GraduationCap,
  KeyRound,
  Share2,
  ChevronRight,
  ChevronLeft,
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
}) => {
  const onlineCount = students.filter((s) => s.status === 'online' || s.status === 'studying').length;
  const pendingCount = pendingRequests.length + passwordResetRequests.length;
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

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
  }, [checkScroll, students.length, pendingCount]);

  // Scroll left/right buttons handler
  const handleScroll = (direction: 'left' | 'right') => {
    const el = tabsRef.current;
    if (!el) return;
    const scrollAmount = Math.max(160, Math.floor(el.clientWidth * 0.6));
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

  const tabs = [
    {
      id: 'roster' as const,
      label: 'Manage Classmates',
      icon: Users,
      badge: (
        <span
          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'roster'
              ? 'bg-zinc-800 dark:bg-[#007acc] text-white'
              : 'bg-zinc-200 dark:bg-[#3c3c3c] text-zinc-800 dark:text-[#cccccc] border border-zinc-300 dark:border-[#4a4a4a]'
            }`}
        >
          {students.length}
        </span>
      ),
    },
    {
      id: 'pending' as const,
      label: 'Requests & Resets',
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
    { id: 'share' as const, label: 'Invite Card & QR', icon: QrCode },
  ];

  return (
    <div className="border-b border-zinc-200 dark:border-[#2d2d2d] bg-white/95 dark:bg-[#252526]/95 backdrop-blur-xl relative sm:sticky sm:top-0 z-20 transition-colors">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-5 space-y-3.5 sm:space-y-4">
        {/* Top Identity & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-zinc-950 dark:bg-[#0e639c] flex items-center justify-center text-white font-black text-base sm:text-lg shadow-xs flex-shrink-0">
              {classroom.name ? classroom.name.slice(0, 1).toUpperCase() : 'C'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-0.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-900 dark:text-[#cccccc] border border-zinc-300 dark:border-[#4a4a4a]">
                  <ShieldCheck className="w-3 h-3 text-zinc-900 dark:text-white" />
                  Class Representative Admin
                </span>
                {classroom.institution && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-800 dark:text-[#cccccc] border border-zinc-300 dark:border-[#4a4a4a] truncate max-w-[150px] sm:max-w-xs">
                    <Building2 className="w-3 h-3 text-zinc-600 dark:text-[#858585] flex-shrink-0" />
                    <span className="truncate">{classroom.institution}</span>
                  </span>
                )}
                {classroom.section && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-800 dark:text-[#cccccc] border border-zinc-300 dark:border-[#4a4a4a]">
                    <GraduationCap className="w-3 h-3 text-zinc-600 dark:text-[#858585] flex-shrink-0" />
                    <span>{classroom.section} {classroom.semester ? `• Sem ${classroom.semester}` : ''}</span>
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight truncate leading-tight">
                {classroom.name || 'Classroom Administration'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-900 dark:text-[#cccccc] border border-zinc-300 dark:border-[#4a4a4a] text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              <span>Live Synced</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('share')}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-950 dark:bg-[#0e639c] hover:bg-zinc-800 dark:hover:bg-[#1177bb] text-white border border-zinc-950 dark:border-[#0e639c] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Invite</span>
            </button>
          </div>
        </div>

        {/* 4 Stat & Action Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {/* Card 1: Enrolled */}
          <div
            onClick={() => setActiveTab('roster')}
            className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#252526] hover:bg-zinc-50 dark:hover:bg-[#2d2d2d] border border-zinc-300/80 dark:border-[#2d2d2d] hover:border-zinc-400 dark:hover:border-[#3c3c3c] transition duration-200 cursor-pointer flex items-center gap-3 group shadow-xs"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-900 dark:text-white border border-zinc-300 dark:border-[#4a4a4a] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg sm:text-2xl font-black text-zinc-950 dark:text-white leading-none">{students.length}</div>
              <div className="text-[10px] sm:text-xs text-zinc-800 dark:text-[#cccccc] font-bold mt-1 truncate">Enrolled Students</div>
              <div className="text-[9.5px] text-zinc-600 dark:text-[#858585] font-semibold truncate hidden sm:block">View Class Roster</div>
            </div>
          </div>

          {/* Card 2: Active Online */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#252526] border border-zinc-300/80 dark:border-[#2d2d2d] flex items-center gap-3 group shadow-xs">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-900 dark:text-white border border-zinc-300 dark:border-[#4a4a4a] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg sm:text-2xl font-black text-zinc-950 dark:text-white leading-none flex items-center gap-1.5">
                <span>{onlineCount}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              </div>
              <div className="text-[10px] sm:text-xs text-zinc-800 dark:text-[#cccccc] font-bold mt-1 truncate">Active Online</div>
              <div className="text-[9.5px] text-zinc-600 dark:text-[#858585] font-semibold truncate hidden sm:block">Real-Time Presence</div>
            </div>
          </div>

          {/* Card 3: Pending Approvals */}
          <div
            onClick={() => setActiveTab('pending')}
            className={`p-3 sm:p-4 rounded-2xl border transition duration-200 cursor-pointer flex items-center gap-3 group shadow-xs ${pendingCount > 0
                ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 hover:border-amber-400'
                : 'bg-white dark:bg-[#252526] border-zinc-300/80 dark:border-[#2d2d2d] hover:border-zinc-400 dark:hover:border-[#3c3c3c]'
              }`}
          >
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${pendingCount > 0
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-800 dark:text-[#cccccc] border border-zinc-300 dark:border-[#4a4a4a]'
                }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg sm:text-2xl font-black leading-none text-zinc-950 dark:text-white">{pendingCount}</div>
              <div className="text-[10px] sm:text-xs text-zinc-800 dark:text-[#cccccc] font-bold mt-1 truncate">Pending Approvals</div>
              <div className="text-[9.5px] text-zinc-600 dark:text-[#858585] font-semibold truncate hidden sm:block">
                {pendingCount > 0 ? 'Action Required' : 'All Requests Cleared'}
              </div>
            </div>
          </div>

          {/* Card 4: Invite Code */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#252526] hover:bg-zinc-50 dark:hover:bg-[#2d2d2d] border border-zinc-300/80 dark:border-[#2d2d2d] hover:border-zinc-400 dark:hover:border-[#3c3c3c] transition duration-200 flex items-center justify-between gap-2 group shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-900 dark:text-white border border-zinc-300 dark:border-[#4a4a4a] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-sm sm:text-lg font-black text-zinc-950 dark:text-white tracking-wider truncate">
                  {classroom.code}
                </div>
                <div className="text-[10px] sm:text-xs text-zinc-800 dark:text-[#cccccc] font-bold mt-0.5 truncate">Class Invite Code</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onCopyCode}
              className={`p-2 rounded-xl border transition flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-95 ${copiedCode
                  ? 'bg-zinc-950 dark:bg-[#0e639c] border-zinc-950 dark:border-[#0e639c] text-white'
                  : 'bg-zinc-100 dark:bg-[#3c3c3c] hover:bg-zinc-200 dark:hover:bg-[#4a4a4a] text-zinc-800 dark:text-[#cccccc] border-zinc-300 dark:border-[#4a4a4a]'
                }`}
              title="Copy Class Invite Code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation Segmented Bar Row with Dual Chevrons, Wheel Scroll & Drag */}
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="relative flex items-center gap-1.5 min-w-0 max-w-full w-full sm:w-auto">
            {/* Scroll Left Button (Visible whenever scrolled right on ALL devices) */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="p-2 rounded-xl border border-zinc-300 dark:border-[#3c3c3c] bg-white dark:bg-[#252526] text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-[#3c3c3c] transition-all flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-95 shadow-xs z-10"
                title="Scroll left"
                aria-label="Scroll tabs left"
              >
                <ChevronLeft className="w-4 h-4 text-zinc-900 dark:text-white" />
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
              className={`inline-flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-zinc-100 dark:bg-[#1e1e1e] border border-zinc-300 dark:border-[#3c3c3c] overflow-x-auto no-scrollbar scroll-smooth min-w-0 flex-1 sm:flex-initial shadow-xs select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={(e) => handleTabClick(tab.id, e)}
                    className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer flex-shrink-0 ${isActive
                        ? 'bg-zinc-950 dark:bg-[#0e639c] text-white shadow-xs'
                        : 'text-zinc-700 dark:text-[#cccccc] hover:text-zinc-950 dark:hover:text-white hover:bg-white dark:hover:bg-[#2d2d2d]'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{tab.label}</span>
                    {tab.badge}
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button (Visible whenever more tabs exist on ALL devices) */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="p-2 rounded-xl border border-zinc-300 dark:border-[#3c3c3c] bg-white dark:bg-[#252526] text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-[#3c3c3c] transition-all flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-95 shadow-xs z-10 animate-pulse"
                title="Scroll right to see more tabs"
                aria-label="Scroll tabs right"
              >
                <ChevronRight className="w-4 h-4 text-zinc-900 dark:text-white" />
              </button>
            )}
          </div>

          {/* Desktop Right Side Balanced Companion */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#252526] border border-zinc-300 dark:border-[#2d2d2d] text-xs font-semibold text-zinc-700 dark:text-[#cccccc] flex-shrink-0 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 dark:bg-[#007acc]" />
            <span>Workspace:</span>
            <span className="text-zinc-950 dark:text-white font-bold">{classroom.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
