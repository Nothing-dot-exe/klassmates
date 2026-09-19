import React, { useState } from 'react';
import { School, Lock, RefreshCw, Clock, ShieldCheck } from 'lucide-react';
import { Classroom, AutoDeleteOption, User, DocumentItem, PendingRequest, PasswordResetRequest } from '@/types';
import { generateRandomCode } from '@/lib/encryption';
import { FactoryResetCard } from './FactoryResetCard';
import { AdminDocumentsCard } from './AdminDocumentsCard';

interface RoomSettingsTabProps {
  classroom: Classroom;
  students: User[];
  documents: DocumentItem[];
  pendingRequests: PendingRequest[];
  passwordResetRequests: PasswordResetRequest[];
  totalMessagesCount: number;
  onUpdateClassroom: (updated: Partial<Classroom>) => void;
  onOpenResetConfirm: () => void;
  showToast: (msg: string) => void;
  onDeleteDocument?: (docId: string) => void;
}

export const RoomSettingsTab: React.FC<RoomSettingsTabProps> = ({
  classroom,
  students,
  documents,
  pendingRequests,
  passwordResetRequests,
  totalMessagesCount,
  onUpdateClassroom,
  onOpenResetConfirm,
  showToast,
  onDeleteDocument,
}) => {
  const [classNameInput, setClassNameInput] = useState(classroom.name);
  const [institutionInput, setInstitutionInput] = useState(classroom.institution);
  const [sectionInput, setSectionInput] = useState(classroom.section);
  const [semesterInput, setSemesterInput] = useState(classroom.semester);
  const [adminDesignationInput, setAdminDesignationInput] = useState(classroom.adminDesignation || 'Class Representative (CR)');
  const [customCodeInput, setCustomCodeInput] = useState(classroom.code);
  const [requireApprovalState, setRequireApprovalState] = useState(classroom.requireApproval);
  const [autoDeleteState, setAutoDeleteState] = useState<AutoDeleteOption>(classroom.autoDeleteSetting);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  const handleRegenerateCode = () => {
    const newCode = generateRandomCode('CS');
    setCustomCodeInput(newCode);
    onUpdateClassroom({ code: newCode });
    showToast(`New Class Code generated: ${newCode}`);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim()) {
      showToast('Classroom name cannot be empty.');
      return;
    }

    onUpdateClassroom({
      name: classNameInput.trim(),
      institution: institutionInput.trim() || 'Classmate Campus',
      section: sectionInput.trim() || 'Section A',
      semester: semesterInput.trim() || 'Semester 1',
      adminDesignation: adminDesignationInput.trim() || 'Class Representative (CR)',
      code: customCodeInput.trim().toUpperCase() || classroom.code,
      requireApproval: requireApprovalState,
      autoDeleteSetting: autoDeleteState,
    });

    showToast('Classroom settings updated successfully!');
  };

  const handleUpdateAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const newPass = adminPasswordInput.trim();
    if (!newPass || newPass.length < 6) {
      showToast('Admin password must be at least 6 characters.');
      return;
    }
    onUpdateClassroom({ adminPassword: newPass });
    showToast('Primary Admin password updated successfully!');
    setAdminPasswordInput('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Classroom Profile & Custom Code */}
      <div className="bg-white dark:bg-[#252526] border border-zinc-300 dark:border-[#2d2d2d] rounded-3xl p-4 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-[#2d2d2d]">
          <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-900 dark:text-white border border-zinc-300 dark:border-[#4a4a4a]">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-950 dark:text-white">Classroom Information & Identification</h3>
            <p className="text-xs text-zinc-600 dark:text-[#858585] font-medium">Update how your class displays across student devices.</p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-[#cccccc]">Classroom Title</label>
              <input
                type="text"
                value={classNameInput}
                onChange={(e) => setClassNameInput(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-300 dark:border-[#3c3c3c] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-950 dark:text-white font-medium placeholder:text-zinc-500 dark:placeholder:text-[#858585] focus:border-zinc-950 dark:focus:border-[#007acc] focus:bg-white dark:focus:bg-[#1e1e1e] focus:outline-none transition shadow-2xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-[#cccccc]">Institution / Department</label>
              <input
                type="text"
                value={institutionInput}
                onChange={(e) => setInstitutionInput(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-300 dark:border-[#3c3c3c] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-950 dark:text-white font-medium placeholder:text-zinc-500 dark:placeholder:text-[#858585] focus:border-zinc-950 dark:focus:border-[#007acc] focus:bg-white dark:focus:bg-[#1e1e1e] focus:outline-none transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-[#cccccc]">Section / Group</label>
              <input
                type="text"
                value={sectionInput}
                onChange={(e) => setSectionInput(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-300 dark:border-[#3c3c3c] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-950 dark:text-white font-medium placeholder:text-zinc-500 dark:placeholder:text-[#858585] focus:border-zinc-950 dark:focus:border-[#007acc] focus:bg-white dark:focus:bg-[#1e1e1e] focus:outline-none transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-[#cccccc]">Semester / Term</label>
              <input
                type="text"
                value={semesterInput}
                onChange={(e) => setSemesterInput(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-300 dark:border-[#3c3c3c] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-950 dark:text-white font-medium placeholder:text-zinc-500 dark:placeholder:text-[#858585] focus:border-zinc-950 dark:focus:border-[#007acc] focus:bg-white dark:focus:bg-[#1e1e1e] focus:outline-none transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-800 dark:text-[#cccccc]">Class Representative / Admin Title</label>
                <span className="text-[10px] text-zinc-600 dark:text-[#858585] font-semibold">Shown to students joining</span>
              </div>
              <input
                type="text"
                value={adminDesignationInput}
                onChange={(e) => setAdminDesignationInput(e.target.value)}
                placeholder="e.g. Class Representative (CR), Student Coordinator"
                className="w-full bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-300 dark:border-[#3c3c3c] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-950 dark:text-white font-medium placeholder:text-zinc-500 dark:placeholder:text-[#858585] focus:border-zinc-950 dark:focus:border-[#007acc] focus:bg-white dark:focus:bg-[#1e1e1e] focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-zinc-800 dark:text-[#cccccc]">Classroom Join Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customCodeInput}
                onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase())}
                className="w-full bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-300 dark:border-[#3c3c3c] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-zinc-950 dark:text-white focus:border-zinc-950 dark:focus:border-[#007acc] focus:bg-white dark:focus:bg-[#1e1e1e] focus:outline-none uppercase tracking-wider transition shadow-2xs"
              />
              <button
                type="button"
                onClick={handleRegenerateCode}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-[#3c3c3c] hover:bg-zinc-200 dark:hover:bg-[#4a4a4a] border border-zinc-300 dark:border-[#4a4a4a] text-zinc-900 dark:text-white text-xs font-bold flex items-center gap-1.5 transition flex-shrink-0 cursor-pointer shadow-xs active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Randomize
              </button>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-[#858585] font-medium">Students enter this code to find and join the room.</p>
          </div>

          {/* Security & Access Policies */}
          <div className="pt-4 border-t border-zinc-200 dark:border-[#2d2d2d] space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-300/80 dark:border-[#3c3c3c]">
              <div className="space-y-0.5">
                <div className="text-xs font-black text-zinc-950 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-zinc-900 dark:text-white" />
                  Admin Join Verification Gate
                </div>
                <div className="text-[11px] text-zinc-700 dark:text-[#cccccc] max-w-md font-medium">
                  When enabled, uninvited students must wait in the lobby until an Admin manually approves them.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireApprovalState}
                  onChange={(e) => setRequireApprovalState(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 dark:bg-[#3c3c3c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-950 dark:peer-checked:bg-[#007acc] border border-zinc-300 dark:border-[#4a4a4a]"></div>
              </label>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-300/80 dark:border-[#3c3c3c] space-y-2">
              <div className="text-xs font-black text-zinc-950 dark:text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-900 dark:text-white" />
                Ephemeral History & Auto-Purge Policy
              </div>
              <p className="text-[11px] text-zinc-700 dark:text-[#cccccc] font-medium">
                Automatically purge past chat logs and media to maintain high classroom privacy.
              </p>
              <select
                value={autoDeleteState}
                onChange={(e) => setAutoDeleteState(e.target.value as AutoDeleteOption)}
                className="w-full bg-white dark:bg-[#252526] border border-zinc-300 dark:border-[#3c3c3c] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-950 dark:text-white focus:border-zinc-950 dark:focus:border-[#007acc] focus:outline-none transition shadow-2xs cursor-pointer"
              >
                <option value="never">Never auto-delete (Keep persistent history)</option>
                <option value="24h">Auto-delete after 24 hours</option>
                <option value="7d">Auto-delete after 7 days</option>
                <option value="30d">Auto-delete after 30 days</option>
                <option value="session_end">Purge when active session ends</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-zinc-950 dark:bg-[#0e639c] hover:bg-zinc-800 dark:hover:bg-[#1177bb] text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
            >
              Save Classroom Changes
            </button>
          </div>
        </form>
      </div>

      {/* 2. Admin Security Password */}
      <div className="bg-white dark:bg-[#252526] border border-zinc-300 dark:border-[#2d2d2d] rounded-3xl p-4 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-[#2d2d2d]">
          <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-900 dark:text-white border border-zinc-300 dark:border-[#4a4a4a]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-950 dark:text-white">Administrator Master Key</h3>
            <p className="text-xs text-zinc-600 dark:text-[#858585] font-medium">Change your master admin authentication passphrase.</p>
          </div>
        </div>

        <form onSubmit={handleUpdateAdminPassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800 dark:text-[#cccccc]">New Admin Master Password</label>
            <input
              type="password"
              placeholder="Enter at least 6 characters..."
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-300 dark:border-[#3c3c3c] rounded-xl px-3.5 py-2.5 text-xs text-zinc-950 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-[#858585] focus:border-zinc-950 dark:focus:border-[#007acc] focus:bg-white dark:focus:bg-[#1e1e1e] focus:outline-none transition shadow-2xs"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end">
            <button
              type="submit"
              disabled={!adminPasswordInput.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-950 dark:bg-[#0e639c] hover:bg-zinc-800 dark:hover:bg-[#1177bb] disabled:opacity-40 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
            >
              Update Admin Key
            </button>
          </div>
        </form>
      </div>

      {/* 3. Document Management for Admin */}
      <AdminDocumentsCard
        documents={documents}
        onDeleteDocument={onDeleteDocument}
        showToast={showToast}
      />

      {/* 4. Factory Reset & Data Backup Component */}
      <FactoryResetCard
        students={students}
        documents={documents}
        pendingRequests={pendingRequests}
        passwordResetRequests={passwordResetRequests}
        totalMessagesCount={totalMessagesCount}
        onOpenResetConfirm={onOpenResetConfirm}
      />
    </div>
  );
};
