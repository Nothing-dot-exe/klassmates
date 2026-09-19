'use client';

import React, { useState } from 'react';
import { X, MessageSquare, Phone, Mail, Edit3, Check, Lock, BadgeCheck } from 'lucide-react';
import { User, Classroom, AutoDeleteOption } from '@/types';
import { ProfileHeader } from './profile/ProfileHeader';
import { ProfileEditForm } from './profile/ProfileEditForm';
import { ProfileSettingsSection } from './profile/ProfileSettingsSection';

export interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  currentUser: User;
  classroom: Classroom;
  onUpdateCurrentUser: (updated: Partial<User>) => void;
  onUpdateAutoDelete?: (val: AutoDeleteOption) => void;
  onClearAllChat?: () => void;
  onStartDm?: (targetUser: User) => void;
  onSignOut?: () => void;
  onLeaveClassroom?: (successorId?: string) => Promise<boolean | void> | void;
  students?: User[];
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUser,
  classroom,
  students,
  onUpdateCurrentUser,
  onUpdateAutoDelete,
  onClearAllChat,
  onStartDm,
  onSignOut,
  onLeaveClassroom,
}) => {
  const isMe = user.id === currentUser.id;
  const activeUser = isMe ? currentUser : user;
  const isClassRep = activeUser.role === 'admin' || activeUser.id === classroom.adminId;
  const [isEditing, setIsEditing] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (updated: Partial<User>) => {
    onUpdateCurrentUser(updated);
    setSaveToast(true);
    setIsEditing(false);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const currentAutoDelete = classroom.autoDeleteSetting || 'off';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-[#27272a] rounded-t-3xl sm:rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92dvh] animate-in slide-in-from-bottom-6 sm:zoom-in-95 transition-colors">
        {/* Mobile Pull Bar */}
        <div className="sm:hidden w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-3 mb-1" />

        {/* Top Handle Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-mono font-bold text-zinc-950 dark:text-zinc-100 truncate">
              @{activeUser.rollNo && !activeUser.rollNo.includes('@')
                ? activeUser.rollNo.toLowerCase()
                : (activeUser.name ? (activeUser.name.includes('@') ? activeUser.name.split('@')[0] : activeUser.name).toLowerCase().replace(/\s+/g, '_') : 'classmate')}
            </span>
            <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
            {(activeUser.role === 'admin' || activeUser.id === classroom.adminId) && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                👑 Class Rep
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#222226] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-4 no-scrollbar">
          {saveToast && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Profile & Privacy updated successfully!</span>
            </div>
          )}

          {/* Profile Header (Avatar, stats, name, bio) */}
          <ProfileHeader
            user={activeUser}
            isClassRep={isClassRep}
            isMe={isMe}
            classroom={classroom}
          />

          {/* Edit Form or Action Buttons */}
          {isEditing ? (
            <ProfileEditForm
              currentUser={currentUser}
              onSave={handleSaveProfile}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="space-y-2">
              {isMe ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#252526] dark:hover:bg-[#2d2d2d] text-zinc-900 dark:text-zinc-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-zinc-300 dark:border-[#383838] active:scale-98 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile & Bio</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onStartDm && onStartDm(activeUser)}
                    className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Direct Message</span>
                  </button>
                  {!isMe && activeUser.phone && activeUser.showPhone !== false && (
                    <a
                      href={`tel:${activeUser.phone}`}
                      className="px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#252526] dark:hover:bg-[#2d2d2d] border border-zinc-300 dark:border-[#383838] text-zinc-900 dark:text-zinc-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                      title="Call classmate"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Call</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Contact Details Card */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#252526] border border-zinc-200 dark:border-[#333333] space-y-2.5 text-xs">
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Contact Information</div>
            
            <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300 gap-2">
              <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                <Mail className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" />
                Email:
              </span>
              {isClassRep ? (
                <div className="flex items-center gap-2 truncate justify-end">
                  <span className="font-mono text-zinc-900 dark:text-zinc-100 truncate">{activeUser.email || 'None'}</span>
                  <span className="text-[10px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-md flex-shrink-0">
                    Class Rep Contact
                  </span>
                </div>
              ) : isMe ? (
                <div className="flex items-center gap-2 truncate justify-end">
                  <span className="font-mono text-zinc-900 dark:text-zinc-100 truncate">{activeUser.email || 'None'}</span>
                  {activeUser.showEmail === false ? (
                    <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-1.5 py-0.5 rounded-md flex items-center gap-1 flex-shrink-0">
                      <Lock className="w-2.5 h-2.5" /> Hidden from Class
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-md flex-shrink-0">
                      Visible
                    </span>
                  )}
                </div>
              ) : activeUser.showEmail !== false ? (
                <span className="font-mono text-zinc-900 dark:text-zinc-100 truncate">{activeUser.email || 'None'}</span>
              ) : (
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1 text-[11px]">
                  <Lock className="w-3 h-3 text-zinc-400" /> Private (Hidden by student)
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300 gap-2">
              <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                <Phone className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" />
                Mobile:
              </span>
              {isClassRep ? (
                <div className="flex items-center gap-2 truncate justify-end">
                  <span className="font-mono text-zinc-900 dark:text-zinc-100 truncate">{activeUser.phone || 'None'}</span>
                  <span className="text-[10px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-md flex-shrink-0">
                    Class Rep Contact
                  </span>
                </div>
              ) : isMe ? (
                <div className="flex items-center gap-2 truncate justify-end">
                  <span className="font-mono text-zinc-900 dark:text-zinc-100 truncate">{activeUser.phone || 'None'}</span>
                  {activeUser.showPhone === false ? (
                    <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-1.5 py-0.5 rounded-md flex items-center gap-1 flex-shrink-0">
                      <Lock className="w-2.5 h-2.5" /> Hidden from Class
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-md flex-shrink-0">
                      Visible
                    </span>
                  )}
                </div>
              ) : activeUser.showPhone !== false ? (
                <span className="font-mono text-zinc-900 dark:text-zinc-100 truncate">{activeUser.phone || 'None'}</span>
              ) : (
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1 text-[11px]">
                  <Lock className="w-3 h-3 text-zinc-400" /> Private (Hidden by student)
                </span>
              )}
            </div>
          </div>

          {/* Shifted Chat & Privacy Preferences for Current User */}
          {isMe && (
            <ProfileSettingsSection
              currentUser={currentUser}
              students={students}
              currentAutoDelete={currentAutoDelete}
              onUpdateCurrentUser={onUpdateCurrentUser}
              onUpdateAutoDelete={onUpdateAutoDelete}
              onClearAllChat={onClearAllChat}
              onSignOut={onSignOut}
              onLeaveClassroom={onLeaveClassroom}
            />
          )}
        </div>
      </div>
    </div>
  );
};
