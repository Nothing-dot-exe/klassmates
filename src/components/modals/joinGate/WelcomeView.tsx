import React from 'react';
import { ShieldCheck, GraduationCap, ChevronRight, Users } from 'lucide-react';
import { Classroom, User } from '@/types';

interface WelcomeViewProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onSignIn: () => void;
  classroom?: Classroom;
  existingStudents?: User[];
  onLoginStudent?: (user: User) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onCreateRoom,
  onJoinRoom,
  onSignIn,
  classroom,
  existingStudents = [],
  onLoginStudent,
}) => {
  const hasActiveClassroom = !!(classroom && (classroom.id || classroom.name));
  const studentCount = existingStudents.length || classroom?.membersCount || 30;
  const adminStudent = existingStudents.find(
    (s) => s.id === classroom?.adminId || s.role === 'admin'
  );

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Active Classroom Spotlight Card */}
      {hasActiveClassroom && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-[#0E1424] border border-zinc-200 dark:border-[#1F2A44] shadow-sm space-y-3 relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] text-zinc-800 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span>Database Synced</span>
            </div>
            <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-[#161F36] border border-indigo-200 dark:border-indigo-500/30 shadow-xs">
              {classroom?.code || 'MCA2026'}
            </span>
          </div>

          <div>
            <h3 className="text-base font-black text-zinc-950 dark:text-white tracking-tight">
              {classroom?.name || 'MCA Batch 2024–2026'}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 truncate">
              {classroom?.institution || 'School of Computer Applications & Technology'}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-200 dark:border-[#1F2A44]">
            <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-300 font-semibold">
              <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{studentCount} Enrolled Students</span>
            </div>
            <span className="text-zinc-600 dark:text-zinc-400 text-[11px]">
              CR: <strong className="text-zinc-900 dark:text-amber-400">{classroom?.adminName || adminStudent?.name || 'Class Representative'}</strong>
            </span>
          </div>

          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={onSignIn}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-md shadow-indigo-950/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Sign In to Classroom</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {adminStudent && onLoginStudent && (
              <button
                type="button"
                onClick={() => onLoginStudent(adminStudent)}
                className="py-2.5 px-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                title="Direct 1-click access as Class Representative (CR)"
              >
                <span>👑 Enter as CR</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Option A: Create Classroom */}
      <button
        type="button"
        onClick={onCreateRoom}
        className="w-full text-left p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1424] border border-zinc-200 dark:border-[#1F2A44] hover:border-indigo-500/40 dark:hover:border-indigo-500/50 hover:shadow-lg transition-all group relative overflow-hidden cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-[#121A2D] text-zinc-900 dark:text-indigo-400 border border-zinc-200 dark:border-[#1F2A44] flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent transition-all">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-[#121A2D] text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-[#1F2A44]">
            Student Lead & CR
          </span>
        </div>

        <div className="mt-3">
          <h3 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">
            Create a New Classroom
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
            Set up a private classroom space for your batch or study group as Class Representative or Student Lead.
          </p>
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
          <span>Start classroom setup</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      {/* Option B: Join Classroom */}
      <button
        type="button"
        onClick={onJoinRoom}
        className="w-full text-left p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1424] border border-zinc-200 dark:border-[#1F2A44] hover:border-indigo-500/40 dark:hover:border-indigo-500/50 hover:shadow-lg transition-all group relative overflow-hidden cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-[#121A2D] text-zinc-900 dark:text-indigo-400 border border-zinc-200 dark:border-[#1F2A44] flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent transition-all">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-[#121A2D] text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-[#1F2A44]">
            Student Enrollment
          </span>
        </div>

        <div className="mt-3">
          <h3 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">
            Join with Class Code
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
            Have a room code from your class representative? Enter the code and submit your verified student enrollment.
          </p>
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
          <span>Enter with Room Code</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      {/* Bottom Sign In Link */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onSignIn}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-medium transition inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>Already enrolled in this class?</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold underline underline-offset-4">Sign In Here</span>
        </button>
      </div>
    </div>
  );
};
