import React from 'react';
import { Shield, Eye, EyeOff, KeyRound, Edit3, Trash2 } from 'lucide-react';
import { User, Classroom } from '@/types';
import { maskEmail, maskPhone } from '@/lib/privacyUtils';
import { getSafeAvatar } from '@/lib/avatarUtils';

interface RosterItemProps {
  student: User;
  classroom: Classroom;
  isRevealed: boolean;
  onToggleReveal: (id: string) => void;
  onToggleRole: (student: User) => void;
  onOpenResetPassword: (student: User) => void;
  onOpenEdit: (student: User) => void;
  onRemoveStudent: (id: string) => void;
  showToast: (msg: string) => void;
}

export const RosterTableRow: React.FC<RosterItemProps> = ({
  student, classroom, isRevealed, onToggleReveal, onToggleRole, onOpenResetPassword, onOpenEdit, onRemoveStudent, showToast,
}) => {
  const isPrimaryAdmin = student.id === (classroom.adminId || 'usr_admin');

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-[#182032]/60 transition-colors">
      <td className="py-3.5 px-6 flex items-center gap-3">
        <img
          src={getSafeAvatar(student.avatar, student.name)}
          alt={student.name}
          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-xs"
        />
        <div>
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            {student.name?.includes('@') ? student.name.split('@')[0] : student.name}
            {student.role === 'admin' ? (
              <span className="text-[9px] bg-indigo-600 text-white border border-indigo-500 px-1.5 py-0.2 rounded font-bold uppercase flex items-center gap-1 shadow-2xs">
                CR Admin
              </span>
            ) : student.designation ? (
              <span className="text-[9px] bg-slate-100 dark:bg-[#182032] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 px-1.5 py-0.2 rounded font-bold uppercase flex items-center gap-1">
                {student.designation}
              </span>
            ) : null}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5 flex-wrap mt-0.5">
            {student.role === 'admin' ? (
              <>
                <span className="text-slate-700 dark:text-slate-300">{student.email}</span>
                {student.phone && <span className="text-slate-900 dark:text-white font-bold">• {student.phone}</span>}
              </>
            ) : (
              <>
                <span className="text-slate-700 dark:text-slate-300">{isRevealed ? student.email : maskEmail(student.email)}</span>
                {student.phone && (
                  <span className="text-slate-500 dark:text-slate-400">
                    • {isRevealed ? student.phone : maskPhone(student.phone)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleReveal(student.id);
                  }}
                  className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white p-0.5 rounded transition cursor-pointer"
                  title={isRevealed ? 'Hide contact details' : 'Click to unmask contact details'}
                >
                  {isRevealed ? <EyeOff className="w-3.5 h-3.5 text-slate-900 dark:text-white" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </>
            )}
          </div>
        </div>
      </td>

      <td className="py-3.5 px-6 font-mono font-bold text-slate-900 dark:text-white">
        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#182032] border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200">
          {student.rollNo?.includes('@') ? (student.role === 'admin' ? 'ADMIN' : 'MEMBER') : student.rollNo}
        </span>
      </td>

      <td className="py-3.5 px-6">
        <button
          onClick={() => onToggleRole(student)}
          disabled={isPrimaryAdmin}
          title={isPrimaryAdmin ? 'Primary admin role cannot be modified' : 'Click to toggle role'}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition inline-flex items-center gap-1 ${
            student.role === 'admin'
              ? 'bg-indigo-600 text-white border border-indigo-500 hover:bg-indigo-500 shadow-2xs'
              : 'bg-slate-100 dark:bg-[#182032] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60'
          } ${isPrimaryAdmin ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
        >
          {student.role === 'admin' ? (
            <>
              <Shield className="w-3 h-3 text-white" />
              Admin
            </>
          ) : (
            'Student'
          )}
        </button>
      </td>

      <td className="py-3.5 px-6">
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 capitalize font-medium">
          <span
            className={`w-2 h-2 rounded-full ${
              student.status === 'online'
                ? 'bg-emerald-500'
                : student.status === 'studying'
                ? 'bg-slate-500 dark:bg-slate-400'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
          {student.status}
        </span>
      </td>

      <td className="py-3.5 px-6 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onOpenResetPassword(student)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#182032] transition cursor-pointer"
            title="Reset Student Password"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenEdit(student)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#182032] transition cursor-pointer"
            title="Edit Student Info"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {!isPrimaryAdmin && (
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to remove ${student.name} from the classroom?`)) {
                  onRemoveStudent(student.id);
                  showToast(`Removed ${student.name} from class.`);
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
              title="Remove Student from Classroom"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const RosterMobileCard: React.FC<RosterItemProps> = ({
  student, classroom, isRevealed, onToggleReveal, onToggleRole, onOpenResetPassword, onOpenEdit, onRemoveStudent, showToast,
}) => {
  const isPrimaryAdmin = student.id === (classroom.adminId || 'usr_admin');

  return (
    <div className="p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 bg-white dark:bg-[#121826] transition-colors">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <img
          src={getSafeAvatar(student.avatar, student.name)}
          alt={student.name || 'Student'}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-xs flex-shrink-0 mt-0.5"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-[180px]">
                {student.name?.includes('@') ? student.name.split('@')[0] : (student.name || 'Classmate')}
              </span>
              {student.role === 'admin' ? (
                <span className="text-[9px] bg-indigo-600 text-white border border-indigo-500 px-1.5 py-0.2 rounded font-bold uppercase inline-flex items-center gap-1 flex-shrink-0 shadow-2xs">
                  CR Admin
                </span>
              ) : student.designation ? (
                <span className="text-[9px] bg-slate-100 dark:bg-[#182032] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 px-1.5 py-0.2 rounded font-bold uppercase inline-flex items-center gap-1 flex-shrink-0">
                  {student.designation}
                </span>
              ) : null}
            </div>

            <span
              className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#182032] border border-slate-200 dark:border-slate-700/60 font-mono font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate max-w-[120px] sm:max-w-none flex-shrink-0 self-start"
              title={student.rollNo}
            >
              {student.rollNo?.includes('@') ? (student.role === 'admin' ? 'ADMIN' : 'MEMBER') : student.rollNo}
            </span>
          </div>

          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5 flex-wrap">
            {student.role === 'admin' ? (
              <>
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[170px] sm:max-w-none">{student.email}</span>
                {student.phone && <span className="text-slate-900 dark:text-white font-bold">• {student.phone}</span>}
              </>
            ) : (
              <>
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px] sm:max-w-none">{isRevealed ? student.email : maskEmail(student.email)}</span>
                {student.phone && (
                  <span className="text-slate-500 dark:text-slate-400">
                    • {isRevealed ? student.phone : maskPhone(student.phone)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleReveal(student.id);
                  }}
                  className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white p-0.5 rounded transition cursor-pointer"
                  title={isRevealed ? 'Hide contact details' : 'Click to unmask contact details'}
                >
                  {isRevealed ? <EyeOff className="w-3.5 h-3.5 text-slate-900 dark:text-white" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleRole(student)}
            disabled={isPrimaryAdmin}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition inline-flex items-center gap-1 cursor-pointer ${
              student.role === 'admin'
                ? 'bg-indigo-600 text-white border border-indigo-500 shadow-2xs'
                : 'bg-slate-100 dark:bg-[#182032] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
            }`}
          >
            {student.role === 'admin' ? (
              <>
                <Shield className="w-3 h-3 text-white" />
                Admin
              </>
            ) : (
              'Student'
            )}
          </button>

          <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 capitalize font-medium">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                student.status === 'online'
                  ? 'bg-emerald-500'
                  : student.status === 'studying'
                  ? 'bg-slate-500 dark:bg-slate-400'
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
            {student.status}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => onOpenResetPassword(student)} className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#182032] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition cursor-pointer" title="Reset Student Password">
            <KeyRound className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onOpenEdit(student)} className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#182032] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition cursor-pointer" title="Edit">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          {!isPrimaryAdmin && (
            <button
              onClick={() => {
                if (confirm(`Remove ${student.name} from class?`)) {
                  onRemoveStudent(student.id);
                  showToast(`Removed ${student.name}`);
                }
              }}
              className="p-2 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 transition cursor-pointer"
              title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
