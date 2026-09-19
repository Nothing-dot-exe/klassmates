import React, { useState, useEffect } from 'react';
import { Edit3, X, KeyRound } from 'lucide-react';
import { User, UserRole } from '@/types';
import { DEFAULT_TEMP_PASSWORD } from '@/lib/privacyUtils';

interface EditStudentModalProps {
  student: User | null;
  onClose: () => void;
  onSave: (studentId: string, updated: Partial<User>) => void;
  onOpenResetPassword?: (student: User) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  onClose,
  onSave,
  onOpenResetPassword,
}) => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    if (student) {
      setName(student.name);
      setNickname(student.nickname || '');
      setRollNo(student.rollNo);
      setRole(student.role);
      setDesignation(student.designation || (student.role === 'admin' ? 'Class Representative (CR)' : 'Classmate'));
      setEmail(student.email);
      setPhone(student.phone || '');
      setShowPhone(!!student.showPhone);
      setShowEmail(!!student.showEmail);
    }
  }, [student]);

  if (!student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(student.id, {
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      rollNo: rollNo.trim().toUpperCase(),
      role,
      isTeacher: false,
      designation: designation.trim() || (role === 'admin' ? 'Class Representative (CR)' : 'Classmate'),
      email: email.trim(),
      phone: phone.trim(),
      showPhone,
      showEmail,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#0E1424] border border-zinc-200 dark:border-[#1F2A44] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92dvh] transition-colors">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-[#1F2A44] bg-zinc-50 dark:bg-[#121A2D]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-[#161F36] text-zinc-900 dark:text-indigo-400 border border-zinc-200 dark:border-[#1F2A44]">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Edit Member Details</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Modify identity, designation, and classroom role</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-[#161F36] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto no-scrollbar">
          {/* Role Switcher */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Classroom Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  if (!designation || designation === 'Classmate') {
                    setDesignation('Class Representative (CR)');
                  }
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  role === 'admin'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-glow-purple'
                    : 'bg-zinc-100 dark:bg-[#121A2D] border-zinc-200 dark:border-[#1F2A44] text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-[#161F36]'
                }`}
              >
                <span>👑</span>
                <span>Class Rep / Co-Admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('student');
                  if (designation === 'Class Representative (CR)') {
                    setDesignation('Classmate');
                  }
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  role !== 'admin'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-glow-purple'
                    : 'bg-zinc-100 dark:bg-[#121A2D] border-zinc-200 dark:border-[#1F2A44] text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-[#161F36]'
                }`}
              >
                <span>🎒</span>
                <span>Student / Classmate</span>
              </button>
            </div>
          </div>

          {/* Designation / Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Designation / Title</label>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">e.g. Class Representative, Student Coordinator</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                'Classmate',
                'Class Representative (CR)',
                'Student Coordinator',
                'Study Group Lead',
                'Batch Representative',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDesignation(preset)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition border cursor-pointer ${
                    designation === preset
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent'
                      : 'bg-zinc-100 dark:bg-[#121A2D] border-zinc-200 dark:border-[#1F2A44] text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-[#161F36]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#161F36] transition shadow-xs"
            />
          </div>

          {/* Nickname / Display Alias */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Nickname / Short Name</label>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Optional</span>
            </div>
            <input
              type="text"
              placeholder={name ? `e.g. ${name.split(' ')[0]}` : 'e.g. Alex'}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#161F36] transition shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#161F36] transition shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Roll Number / USN
              </label>
              <input
                type="text"
                required
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#161F36] uppercase transition shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Admin Access</label>
              <select
                value={role}
                disabled={student.id === 'usr_admin'}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#161F36] transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <option value="student">Normal Member</option>
                <option value="admin">Room Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#161F36] transition shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Mobile / WhatsApp Number</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#161F36] transition shadow-xs"
            />
          </div>

          {/* Privacy Controls */}
          <div className="bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl p-3 space-y-2">
            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
              Privacy Controls
            </span>
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={showPhone}
                onChange={(e) => setShowPhone(e.target.checked)}
                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Allow other students to view mobile number</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Allow other students to view email address</span>
            </label>
          </div>

          {/* HR Password Reset Action */}
          {onOpenResetPassword && (
            <div className="pt-2 border-t border-zinc-200 dark:border-[#1F2A44] flex items-center justify-between">
              <button
                type="button"
                onClick={() => onOpenResetPassword(student)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-[#161F36] hover:bg-zinc-200 dark:hover:bg-[#1c2744] text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-[#1F2A44] text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>HR Reset Password</span>
              </button>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Default: {DEFAULT_TEMP_PASSWORD}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-[#1F2A44] bg-zinc-100 dark:bg-[#121A2D] text-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#161F36] text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-95 text-white text-xs font-bold shadow-glow-purple transition active:scale-95 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
