import React from 'react';
import { ShieldCheck, GraduationCap, ChevronRight, School, Users } from 'lucide-react';
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
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-200 dark:border-[#2d2d2d] shadow-sm space-y-3 relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white dark:bg-[#252526] border border-zinc-200 dark:border-[#3c3c3c] text-zinc-800 dark:text-[#cccccc] text-[10px] font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Database Synced</span>
            </div>
            <span className="font-mono text-xs font-black text-zinc-900 dark:text-white px-2.5 py-0.5 rounded-lg bg-white dark:bg-[#252526] border border-zinc-200 dark:border-[#3c3c3c] shadow-xs">
              {classroom?.code || 'MCA2026'}
            </span>
          </div>

          <div>
            <h3 className="text-base font-black text-zinc-950 dark:text-white tracking-tight">
              {classroom?.name || 'MCA Batch 2024–2026'}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-[#858585] mt-0.5 truncate">
              {classroom?.institution || 'School of Computer Applications & Technology'}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-[#858585] pt-1 border-t border-zinc-200 dark:border-[#2d2d2d]">
            <div className="flex items-center gap-1.5 text-zinc-800 dark:text-[#cccccc] font-semibold">
              <Users className="w-3.5 h-3.5 text-zinc-600 dark:text-[#858585]" />
              <span>{studentCount} Enrolled Students</span>
            </div>
            <span className="text-zinc-600 dark:text-[#858585] text-[11px]">
              CR: <strong className="text-zinc-900 dark:text-white">{classroom?.adminName || adminStudent?.name || 'Class Representative'}</strong>
            </span>
          </div>

          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={onSignIn}
              className="flex-1 py-2.5 px-4 rounded-xl bg-black dark:bg-[#0e639c] hover:bg-zinc-800 dark:hover:bg-[#1177bb] text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Sign In to Classroom</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {adminStudent && onLoginStudent && (
              <button
                type="button"
                onClick={() => onLoginStudent(adminStudent)}
                className="py-2.5 px-3 rounded-xl bg-zinc-200 dark:bg-[#3c3c3c] hover:bg-zinc-300 dark:hover:bg-[#4a4a4a] text-zinc-900 dark:text-white text-xs font-bold border border-zinc-300 dark:border-[#4a4a4a] transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
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
        className="w-full text-left p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-[#2d2d2d] hover:border-zinc-400 dark:hover:border-[#007acc] hover:shadow-md transition-all group relative overflow-hidden cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-[#252526] text-zinc-900 dark:text-[#cccccc] border border-zinc-200 dark:border-[#3c3c3c] flex items-center justify-center group-hover:bg-black dark:group-hover:bg-[#007acc] group-hover:text-white group-hover:border-black dark:group-hover:border-[#007acc] transition-all">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-[#252526] text-zinc-800 dark:text-[#cccccc] border border-zinc-200 dark:border-[#3c3c3c]">
            Student Lead & CR
          </span>
        </div>

        <div className="mt-3">
          <h3 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white group-hover:text-black dark:group-hover:text-white transition">
            Create a New Classroom
          </h3>
          <p className="text-xs text-zinc-600 dark:text-[#858585] mt-1 leading-relaxed">
            Set up a private classroom space for your batch or study group as Class Representative or Student Lead.
          </p>
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-[#007acc] group-hover:translate-x-1 transition-transform">
          <span>Start classroom setup</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      {/* Option B: Join Classroom */}
      <button
        type="button"
        onClick={onJoinRoom}
        className="w-full text-left p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-[#2d2d2d] hover:border-zinc-400 dark:hover:border-[#007acc] hover:shadow-md transition-all group relative overflow-hidden cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-[#252526] text-zinc-900 dark:text-[#cccccc] border border-zinc-200 dark:border-[#3c3c3c] flex items-center justify-center group-hover:bg-black dark:group-hover:bg-[#007acc] group-hover:text-white group-hover:border-black dark:group-hover:border-[#007acc] transition-all">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-[#252526] text-zinc-800 dark:text-[#cccccc] border border-zinc-200 dark:border-[#3c3c3c]">
            Student Enrollment
          </span>
        </div>

        <div className="mt-3">
          <h3 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white group-hover:text-black dark:group-hover:text-white transition">
            Join with Class Code
          </h3>
          <p className="text-xs text-zinc-600 dark:text-[#858585] mt-1 leading-relaxed">
            Have a room code from your class representative? Enter the code and submit your verified student enrollment.
          </p>
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-[#007acc] group-hover:translate-x-1 transition-transform">
          <span>Enter with Room Code</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      {/* Bottom Sign In Link */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onSignIn}
          className="text-xs text-zinc-500 dark:text-[#858585] hover:text-zinc-950 dark:hover:text-white font-medium transition inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>Already enrolled in this class?</span>
          <span className="text-zinc-900 dark:text-[#007acc] font-bold underline underline-offset-4">Sign In Here</span>
        </button>
      </div>
    </div>
  );
};
