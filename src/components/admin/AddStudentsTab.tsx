import React, { useState } from 'react';
import { UserPlus, Layers } from 'lucide-react';
import { User, UserRole } from '@/types';
import { DEFAULT_TEMP_PASSWORD } from '@/lib/privacyUtils';

interface AddStudentsTabProps {
  students: User[];
  onAddStudent: (student: User) => void;
  onBulkAddStudents?: (students: User[]) => void;
  showToast: (msg: string) => void;
}

export const AddStudentsTab: React.FC<AddStudentsTabProps> = ({
  students,
  onAddStudent,
  onBulkAddStudents,
  showToast,
}) => {
  const [newName, setNewName] = useState('');
  const [newRollNo, setNewRollNo] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [bulkRollInput, setBulkRollInput] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRollNo.trim()) return;

    const formattedRoll = newRollNo.trim().toUpperCase();

    if (students.some((s) => s.rollNo.toUpperCase() === formattedRoll)) {
      showToast(`Warning: Roll Number ${formattedRoll} is already registered!`);
      return;
    }

    const newStudent: User = {
      id: `usr_${Date.now()}`,
      name: newName.trim(),
      rollNo: formattedRoll,
      phone: newPhone.trim(),
      email: newEmail.trim() || `${formattedRoll.toLowerCase()}@classmate.edu`,
      password: newPassword.trim() || DEFAULT_TEMP_PASSWORD,
      mustChangePassword: !newPassword.trim(),
      showPhone: false,
      showEmail: false,
      role: newRole,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${formattedRoll}`,
      status: 'online',
      joinedAt: new Date().toISOString().split('T')[0],
      bio: 'Enrolled via Admin Panel',
    };

    onAddStudent(newStudent);
    setNewName('');
    setNewRollNo('');
    setNewPhone('');
    setNewEmail('');
    setNewPassword('');
    showToast(`Added ${newStudent.name} (${newStudent.rollNo}) to roster!`);
  };

  const handleBulkAdd = () => {
    if (!bulkRollInput.trim()) return;

    const rawTokens = bulkRollInput
      .split(/[\n,]+/)
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length >= 2);

    const uniqueTokens = Array.from(new Set(rawTokens));
    const studentsToAdd: User[] = [];

    uniqueTokens.forEach((roll, index) => {
      if (!students.some((s) => s.rollNo.toUpperCase() === roll)) {
        studentsToAdd.push({
          id: `usr_bulk_${Date.now()}_${index}`,
          name: `Student ${roll}`,
          rollNo: roll,
          phone: '',
          email: `${roll.toLowerCase()}@classmate.edu`,
          password: DEFAULT_TEMP_PASSWORD,
          mustChangePassword: true,
          showPhone: false,
          showEmail: false,
          role: 'student',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${roll}`,
          status: 'offline',
          joinedAt: new Date().toISOString().split('T')[0],
          bio: 'Enrolled via Bulk Whitelist',
        });
      }
    });

    if (studentsToAdd.length === 0) {
      showToast('All entered roll numbers are already registered.');
      return;
    }

    if (onBulkAddStudents) {
      onBulkAddStudents(studentsToAdd);
    } else {
      studentsToAdd.forEach((st) => onAddStudent(st));
    }

    setBulkRollInput('');
    showToast(`Imported and whitelisted ${studentsToAdd.length} students in 1 batch!`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Single Add Form */}
      <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-[#27272a] rounded-3xl p-4 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 rounded-xl bg-zinc-100 dark:bg-[#18181b] text-zinc-900 dark:text-indigo-400 border border-zinc-200 dark:border-[#27272a]">
            <UserPlus className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-zinc-950 dark:text-white">Add Individual Student</h3>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6 font-medium">
          Register a student directly into the classroom with their Roll Number.
        </p>

        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-300 mb-1">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Priya Sharma"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#222226] transition shadow-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-300 mb-1">
                Roll Number / ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 22CS095"
                value={newRollNo}
                onChange={(e) => setNewRollNo(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#222226] transition shadow-xs uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-300 mb-1">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-950 dark:text-white font-semibold focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#222226] transition shadow-xs cursor-pointer"
              >
                <option value="student">Student</option>
                <option value="admin">Co-Admin / Class Rep</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-300 mb-1">
                Mobile Number <span className="text-zinc-500 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                placeholder="+91 98765..."
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#222226] transition shadow-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-300 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="student@university.edu"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#222226] transition shadow-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-300 mb-1">
              Initial Password <span className="text-zinc-500 font-normal">(defaults to {DEFAULT_TEMP_PASSWORD})</span>
            </label>
            <input
              type="text"
              placeholder={`Leave blank to use default (${DEFAULT_TEMP_PASSWORD})`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#222226] transition font-mono shadow-xs"
            />
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 font-medium">
              If left blank, student must change their password on first login.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-950/20 transition active:scale-95 cursor-pointer"
          >
            Add Student to Roster
          </button>
        </form>
      </div>

      {/* Bulk Roll Number Import */}
      <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-[#27272a] rounded-3xl p-4 sm:p-8 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-[#18181b] text-zinc-900 dark:text-indigo-400 border border-zinc-200 dark:border-[#27272a]">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-zinc-950 dark:text-white">Bulk Roll Number Whitelist</h3>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 font-medium">
            Paste entire class roll numbers (comma or newline separated). They will be automatically enrolled and able to chat.
          </p>

          <textarea
            rows={6}
            placeholder={'22CS001, 22CS002, 22CS003\n22CS004\n22CS005...'}
            value={bulkRollInput}
            onChange={(e) => setBulkRollInput(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl p-3 text-xs font-mono font-semibold text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#222226] transition shadow-xs"
          />
        </div>

        <button
          type="button"
          onClick={handleBulkAdd}
          disabled={!bulkRollInput.trim()}
          className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-md shadow-indigo-950/20"
        >
          Import & Whitelist Roll Numbers
        </button>
      </div>
    </div>
  );
};
