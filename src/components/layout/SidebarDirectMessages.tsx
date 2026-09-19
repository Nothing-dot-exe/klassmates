import React from 'react';
import { User, Classroom } from '@/types';
import { getSafeAvatar } from '@/lib/avatarUtils';

interface SidebarDirectMessagesProps {
  otherStudents: User[];
  classroom: Classroom;
  selectedDmUserId: string;
  activeView: string;
  onSelectDm: (userId: string) => void;
  onOpenProfile?: (user: User) => void;
}

export const SidebarDirectMessages: React.FC<SidebarDirectMessagesProps> = ({
  otherStudents,
  classroom,
  selectedDmUserId,
  activeView,
  onSelectDm,
  onOpenProfile,
}) => {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-bold text-zinc-400 dark:text-[#858585] uppercase tracking-wider px-3 pb-1 flex items-center justify-between">
        <span>Direct Chats (DMs)</span>
        <span className="text-zinc-400 dark:text-[#858585]">#{otherStudents.length}</span>
      </div>

      {otherStudents.length === 0 ? (
        <div className="px-3 py-3 rounded-2xl bg-zinc-50 dark:bg-[#252526] border border-zinc-200 dark:border-[#2d2d2d] text-center space-y-1">
          <p className="text-[11px] text-zinc-600 dark:text-[#cccccc] font-medium">No students added yet</p>
          <p className="text-[10px] text-zinc-400 dark:text-[#858585]">Add via Admin Panel or share Class Code</p>
        </div>
      ) : (
        otherStudents.map((st) => {
          const isSelected = activeView === 'dm' && selectedDmUserId === st.id;

          return (
            <button
              key={st.id}
              onClick={() => onSelectDm(st.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${isSelected
                  ? 'bg-zinc-950 dark:bg-[#37373d] text-white dark:border-l-2 dark:border-[#007acc] shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-[#cccccc] hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#2a2d2e]'
                }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  onClick={(e) => {
                    if (onOpenProfile) {
                      e.stopPropagation();
                      onOpenProfile(st);
                    }
                  }}
                  className="relative flex-shrink-0 cursor-pointer p-[1px] rounded-full hover:ring-2 hover:ring-black dark:hover:ring-[#007acc] transition"
                  title={`View ${st.name}'s Profile`}
                >
                  <img
                    src={getSafeAvatar(st.avatar, st.name)}
                    alt={st.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-[#3c3c3c] bg-zinc-100 dark:bg-[#252526]"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-[#1e1e1e] ${st.status === 'studying'
                        ? 'bg-zinc-600 dark:bg-zinc-400'
                        : st.status === 'online'
                          ? 'bg-emerald-500'
                          : 'bg-zinc-300 dark:bg-zinc-600'
                      }`}
                  />
                </div>

                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-semibold">
                      {st.nickname?.trim() || (st.name?.includes('@') ? st.name.split('@')[0] : st.name)}
                    </span>
                    {(st.role === 'admin' || st.id === classroom.adminId) && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border flex-shrink-0 ${isSelected
                          ? 'bg-zinc-800 dark:bg-[#007acc] text-white border-zinc-700 dark:border-[#007acc]'
                          : 'bg-zinc-100 dark:bg-[#252526] text-zinc-800 dark:text-[#cccccc] border-zinc-200 dark:border-[#3c3c3c]'
                        }`}>
                        👑 CR
                      </span>
                    )}
                  </div>
                  <div className={`text-[10px] font-mono truncate ${isSelected ? 'text-zinc-300 dark:text-[#9cdcfe]' : 'text-zinc-400 dark:text-[#858585]'
                    }`}>
                    {st.nickname?.trim() && st.nickname.trim() !== st.name.trim()
                      ? `${st.name}${st.rollNo && !st.rollNo.includes('@') ? ` • ${st.rollNo}` : ''}`
                      : (st.rollNo && !st.rollNo.includes('@') ? st.rollNo : '')}
                  </div>
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
};
