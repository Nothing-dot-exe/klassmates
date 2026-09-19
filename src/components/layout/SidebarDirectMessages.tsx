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
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classroom.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1">
      <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider px-2 pb-1 flex items-center justify-between">
        <span>Direct Chats (DMs)</span>
        <span className="font-mono text-xs font-semibold text-slate-400 dark:text-zinc-400">#{otherStudents.length}</span>
      </div>

      {otherStudents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 bg-white/70 dark:bg-[#0E1528]/60 p-4 text-center flex flex-col items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-zinc-800/70 flex items-center justify-center text-slate-500 dark:text-zinc-400 mb-2">
            <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="1.75" viewBox="0 0 24 24">
              <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-200 mb-1">No students added yet</h4>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-[200px] leading-relaxed mb-2.5">
            Add via Admin Panel or share Class Code with your batchmates.
          </p>
          <button
            onClick={handleCopyCode}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95 text-indigo-600 dark:text-indigo-300 text-[11px] font-semibold tracking-wide border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{copied ? 'Code Copied!' : 'Share Class Code'}</span>
          </button>
        </div>
      ) : (
        otherStudents.map((st) => {
          const isSelected = activeView === 'dm' && selectedDmUserId === st.id;

          return (
            <button
              key={st.id}
              onClick={() => onSelectDm(st.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                isSelected
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-200 shadow-glow-purple font-semibold'
                  : 'text-slate-600 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 border border-transparent'
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
                  className="relative flex-shrink-0 cursor-pointer p-[1px] rounded-full hover:ring-2 hover:ring-indigo-500 transition"
                  title={`View ${st.name}'s Profile`}
                >
                  <img
                    src={getSafeAvatar(st.avatar, st.name)}
                    alt={st.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-[#0E1528]"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-[#09090b] ${
                      st.status === 'studying'
                        ? 'bg-amber-400'
                        : st.status === 'online'
                          ? 'bg-emerald-500'
                          : 'bg-slate-400'
                    }`}
                  />
                </div>

                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {st.nickname?.trim() || (st.name?.includes('@') ? st.name.split('@')[0] : st.name)}
                    </span>
                    {(st.role === 'admin' || st.id === classroom.adminId) && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex-shrink-0">
                        👑 CR
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono truncate text-slate-400">
                    {st.nickname?.trim() && st.nickname.trim() !== st.name.trim()
                      ? `${st.name}${st.rollNo && !st.rollNo.includes('@') ? ` • #${st.rollNo}` : ''}`
                      : (st.rollNo && !st.rollNo.includes('@') ? `#${st.rollNo}` : '')}
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
