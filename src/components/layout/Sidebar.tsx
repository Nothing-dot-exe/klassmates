'use client';

import React from 'react';
import {
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { Channel, Classroom, User, ChatMessage } from '@/types';
import { CURRENT_USER } from '@/lib/mockData';
import { ClassRepBanner } from './ClassRepBanner';
import { SidebarChannels } from './SidebarChannels';
import { SidebarDirectMessages } from './SidebarDirectMessages';
import { SidebarUserFooter } from './SidebarUserFooter';
import { ThemeToggle } from '@/components/common/ThemeToggle';

interface SidebarProps {
  classroom: Classroom;
  channels: Channel[];
  students: User[];
  currentUser: User;
  activeView: 'channel' | 'dm' | 'documents' | 'admin';
  selectedChannelId: string;
  selectedDmUserId: string;
  pendingRequestsCount: number;
  documentsCount: number;
  onSelectChannel: (channelId: string) => void;
  onSelectDm: (userId: string) => void;
  onSelectView: (view: 'documents' | 'admin') => void;
  onOpenSettings?: () => void;
  onSignOut?: () => void;
  onOpenProfile?: (user: User) => void;
  messages?: Record<string, ChatMessage[]>;
  onlineUserIds?: Set<string>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  classroom,
  channels,
  students,
  currentUser,
  activeView,
  selectedChannelId,
  selectedDmUserId,
  pendingRequestsCount,
  documentsCount,
  onSelectChannel,
  onSelectDm,
  onSelectView,
  onOpenSettings,
  onSignOut,
  onOpenProfile,
  messages,
  onlineUserIds,
}) => {
  const otherStudents = students.filter((s) => s.id !== currentUser.id);
  const classRep =
    students.find((s) => s.role === 'admin' || s.id === classroom.adminId) ||
    (currentUser.role === 'admin' ? currentUser : null) ||
    CURRENT_USER;

  return (
    <aside className="w-64 md:w-72 h-full bg-[#F1EBF5] dark:bg-[#121214] border-r border-[#DFD3E7] dark:border-zinc-800/80 flex flex-col justify-between select-none transition-colors">
      {/* Header Profile / Classroom Title */}
      <div className="p-4 border-b border-[#DFD3E7] dark:border-zinc-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          {/* Live status pill with Stitch pulse-dot-ring */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="pulse-dot-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
              Classroom Active
            </span>
          </div>

          <ThemeToggle className="p-1 text-slate-500 dark:text-zinc-400" />
        </div>

        <div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight" title={classroom.name}>
            {classroom.name}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            {classroom.institution || 'Autonomous Classroom Space'}
          </p>
        </div>
      </div>

      {/* Navigation Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 no-scrollbar">
        {/* Class Representative / Student Admin Card (for students only) */}
        {classRep && classRep.id && currentUser.role !== 'admin' && (
          <ClassRepBanner
            admin={classRep}
            currentUserId={currentUser.id}
            onSelectDm={onSelectDm}
          />
        )}

        {/* Core Hub Views */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider px-2 pb-0.5">
            Classroom Hubs
          </div>

          <button
            onClick={() => onSelectView('documents')}
            className={`w-full group relative overflow-hidden rounded-xl p-3 font-semibold flex items-center justify-between transition-all duration-150 cursor-pointer ${
              activeView === 'documents'
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-glow-purple active:scale-[0.99]'
                : 'bg-slate-100 dark:bg-[#0E1528] hover:bg-slate-200/80 dark:hover:bg-[#131D36] border border-slate-200 dark:border-zinc-800/80 text-slate-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeView === 'documents' ? 'bg-white/20 text-white shadow-inner' : 'bg-slate-200 dark:bg-zinc-800 text-indigo-500 dark:text-indigo-400'
              }`}>
                <FileText className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold tracking-wide">Document Vault</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
              activeView === 'documents' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700'
            }`}>
              {documentsCount}
            </span>
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => onSelectView('admin')}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-glow-purple active:scale-[0.99]'
                  : 'bg-slate-100 dark:bg-[#0E1528] hover:bg-slate-200/80 dark:hover:bg-[#131D36] border border-slate-200 dark:border-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  activeView === 'admin' ? 'bg-white/20 text-white shadow-inner' : 'bg-slate-200 dark:bg-zinc-800 text-indigo-500 dark:text-indigo-400'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-semibold">Admin Panel</span>
              </div>
              {pendingRequestsCount > 0 && (
                <span className="h-4 px-1.5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Section 1: Class Channels */}
        <SidebarChannels
          channels={channels}
          selectedChannelId={selectedChannelId}
          activeView={activeView}
          onSelectChannel={onSelectChannel}
        />

        {/* Section 2: Direct Messages */}
        <SidebarDirectMessages
          otherStudents={otherStudents}
          classroom={classroom}
          selectedDmUserId={selectedDmUserId}
          activeView={activeView}
          onSelectDm={onSelectDm}
          onOpenProfile={onOpenProfile}
          messages={messages}
          currentUserId={currentUser.id}
          onlineUserIds={onlineUserIds}
        />
      </div>

      {/* Bottom User Footer */}
      <SidebarUserFooter
        currentUser={currentUser}
        onOpenSettings={onOpenSettings}
        onSignOut={onSignOut}
      />
    </aside>
  );
};
