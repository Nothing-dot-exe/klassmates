import React, { useState } from 'react';
import { Search, X, Users, UserPlus } from 'lucide-react';
import { User, Classroom } from '@/types';
import { RosterTableRow, RosterMobileCard } from './RosterItem';

interface RosterTabProps {
  classroom: Classroom;
  students: User[];
  onOpenAddTab: () => void;
  onOpenEdit: (student: User) => void;
  onOpenResetPassword: (student: User) => void;
  onRemoveStudent: (id: string) => void;
  onToggleRole: (student: User) => void;
  showToast: (msg: string) => void;
}

export const RosterTab: React.FC<RosterTabProps> = ({
  classroom,
  students,
  onOpenAddTab,
  onOpenEdit,
  onOpenResetPassword,
  onRemoveStudent,
  onToggleRole,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('all');
  const [revealedInfoIds, setRevealedInfoIds] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedInfoIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q);

    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'admin'
          ? s.role === 'admin'
          : s.role === 'student';

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#252526] border border-zinc-300 dark:border-[#2d2d2d] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-[#858585]" />
          <input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-300 dark:border-[#3c3c3c] rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-950 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-[#858585] focus:outline-none focus:border-zinc-950 dark:focus:border-[#007acc] focus:bg-white dark:focus:bg-[#1e1e1e] transition shadow-2xs font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 dark:text-[#858585] dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${roleFilter === 'all'
                ? 'bg-zinc-950 dark:bg-[#0e639c] text-white shadow-xs'
                : 'text-zinc-700 dark:text-[#cccccc] hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#3c3c3c]'
              }`}
          >
            All ({students.length})
          </button>
          <button
            onClick={() => setRoleFilter('student')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${roleFilter === 'student'
                ? 'bg-zinc-950 dark:bg-[#0e639c] text-white shadow-xs'
                : 'text-zinc-700 dark:text-[#cccccc] hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#3c3c3c]'
              }`}
          >
            Students
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${roleFilter === 'admin'
                ? 'bg-zinc-950 dark:bg-[#0e639c] text-white shadow-xs'
                : 'text-zinc-700 dark:text-[#cccccc] hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#3c3c3c]'
              }`}
          >
            Class Reps / Admins
          </button>
        </div>
      </div>

      {/* Classmate Table Card */}
      <div className="bg-white dark:bg-[#252526] border border-zinc-300 dark:border-[#2d2d2d] rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-[#2d2d2d] flex items-center justify-between flex-wrap gap-2.5">
          <div>
            <h3 className="text-sm font-black text-zinc-950 dark:text-white">Classmates Roster</h3>
            <p className="text-xs text-zinc-600 dark:text-[#858585] font-medium">
              Showing {filteredStudents.length} of {students.length} registered members
            </p>
          </div>
          <button
            onClick={onOpenAddTab}
            className="px-3.5 py-1.5 bg-zinc-950 dark:bg-[#0e639c] hover:bg-zinc-800 dark:hover:bg-[#1177bb] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer flex-shrink-0 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Student
          </button>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="p-4 rounded-full bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-600 dark:text-[#858585] inline-block">
              <Users className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-zinc-950 dark:text-white">No classmates found</h4>
            <p className="text-xs text-zinc-600 dark:text-[#858585] max-w-sm mx-auto">
              {searchQuery
                ? `No student matches "${searchQuery}". Check the spelling or clear the filter.`
                : 'There are no students in this classroom yet. Click "Add Student" or share your Class Code.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-zinc-100 dark:bg-[#3c3c3c] hover:bg-zinc-200 dark:hover:bg-[#4a4a4a] text-zinc-900 dark:text-white text-xs font-semibold rounded-xl transition border border-zinc-300 dark:border-[#4a4a4a]"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100/90 dark:bg-[#1e1e1e] text-zinc-700 dark:text-[#cccccc] uppercase tracking-wider text-[10px] font-bold border-b border-zinc-200 dark:border-[#2d2d2d]">
                  <tr>
                    <th className="py-3 px-6">Classmate</th>
                    <th className="py-3 px-6">Roll Number / ID</th>
                    <th className="py-3 px-6">Role</th>
                    <th className="py-3 px-6">Presence</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-[#2d2d2d]">
                  {filteredStudents.map((student) => (
                    <RosterTableRow
                      key={student.id}
                      student={student}
                      classroom={classroom}
                      isRevealed={!!revealedInfoIds[student.id]}
                      onToggleReveal={toggleReveal}
                      onToggleRole={onToggleRole}
                      onOpenResetPassword={onOpenResetPassword}
                      onOpenEdit={onOpenEdit}
                      onRemoveStudent={onRemoveStudent}
                      showToast={showToast}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Roster Cards */}
            <div className="block sm:hidden divide-y divide-zinc-200 dark:divide-[#2d2d2d]">
              {filteredStudents.map((student) => (
                <RosterMobileCard
                  key={student.id}
                  student={student}
                  classroom={classroom}
                  isRevealed={!!revealedInfoIds[student.id]}
                  onToggleReveal={toggleReveal}
                  onToggleRole={onToggleRole}
                  onOpenResetPassword={onOpenResetPassword}
                  onOpenEdit={onOpenEdit}
                  onRemoveStudent={onRemoveStudent}
                  showToast={showToast}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
