'use client';

import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
import { Channel, Classroom, User } from '@/types';
import { CURRENT_USER } from '@/lib/mockData';
import { ClassRepBanner } from './ClassRepBanner';
import { SidebarChannels } from './SidebarChannels';
import { SidebarDirectMessages } from './SidebarDirectMessages';
import { SidebarUserFooter } from './SidebarUserFooter';

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
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(classroom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const otherStudents = students.filter((s) => s.id !== currentUser.id);
  const classRep =
    students.find((s) => s.role === 'admin' || s.id === classroom.adminId) ||
    (currentUser.role === 'admin' ? currentUser : null) ||
    CURRENT_USER;

  return (
    <aside className="w-64 md:w-72 h-full bg-zinc-50/90 dark:bg-[#181818] border-r border-zinc-200 dark:border-[#2d2d2d] flex flex-col justify-between select-none transition-colors">
      {/* Header Profile / Classroom Title */}
      <div className="p-4 border-b border-zinc-200 dark:border-[#2d2d2d]">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-[#252526] border border-zinc-200 dark:border-[#3c3c3c] text-[10px] font-bold tracking-wider text-zinc-800 dark:text-[#cccccc] uppercase shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Classroom Active</span>
          </div>
        </div>

        <h1 className="text-base font-black text-zinc-950 dark:text-white truncate mt-2 leading-snug tracking-tight" title={classroom.name}>
          {classroom.name}
        </h1>

        {/* Class Code Pill with 1-click Copy */}
        <div
          onClick={handleCopyCode}
          className="mt-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-white dark:bg-[#252526] border border-zinc-200 dark:border-[#3c3c3c] hover:border-zinc-400 dark:hover:border-[#007acc] cursor-pointer transition group shadow-xs"
          title="Click to copy Class Code"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-[#858585]">Class Code:</span>
            <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white">{classroom.code}</span>
          </div>
          <span className="text-[10px] text-zinc-500 dark:text-[#858585] group-hover:text-zinc-950 dark:group-hover:text-white flex items-center gap-1">
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy'}</span>
          </span>
        </div>
      </div>

      {/* Navigation Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 no-scrollbar">
        {/* Class Representative / Student Admin Card */}
        {classRep && classRep.id && (
          <ClassRepBanner
            admin={classRep}
            currentUserId={currentUser.id}
            onSelectDm={onSelectDm}
          />
        )}

        {/* Core Hub Views */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-zinc-400 dark:text-[#858585] uppercase tracking-wider px-3 pb-1">
            Classroom Hubs
          </div>

          <button
            onClick={() => onSelectView('documents')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${activeView === 'documents'
                ? 'bg-zinc-950 dark:bg-[#37373d] text-white dark:border-l-2 dark:border-[#007acc] shadow-xs'
                : 'text-zinc-600 dark:text-[#cccccc] hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#2a2d2e]'
              }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className={`w-4 h-4 ${activeView === 'documents' ? 'text-white' : 'text-zinc-500 dark:text-[#858585]'}`} />
              <span>Document Vault</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeView === 'documents' ? 'bg-zinc-800 dark:bg-[#007acc] text-white' : 'bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-700 dark:text-[#cccccc]'
              }`}>
              {documentsCount}
            </span>
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => onSelectView('admin')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${activeView === 'admin'
                  ? 'bg-zinc-950 dark:bg-[#37373d] text-white dark:border-l-2 dark:border-[#007acc] shadow-xs'
                  : 'text-zinc-600 dark:text-[#cccccc] hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#2a2d2e]'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className={`w-4 h-4 ${activeView === 'admin' ? 'text-white' : 'text-zinc-500 dark:text-[#858585]'}`} />
                <span>Admin Panel</span>
              </div>
              {pendingRequestsCount > 0 && (
                <span className="h-4 px-1.5 rounded-full bg-black dark:bg-[#0e639c] text-white font-bold text-[10px] flex items-center justify-center">
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
