import React from 'react';
import { School, RefreshCw } from 'lucide-react';

export interface ClassroomConfigSectionProps {
  newRoomName: string;
  setNewRoomName: (v: string) => void;
  newRoomSection: string;
  setNewRoomSection: (v: string) => void;
  newRoomSemester: string;
  setNewRoomSemester: (v: string) => void;
  newRoomInstitution: string;
  setNewRoomInstitution: (v: string) => void;
  newRoomCode: string;
  setNewRoomCode: (v: string) => void;
}

export const ClassroomConfigSection: React.FC<ClassroomConfigSectionProps> = ({
  newRoomName,
  setNewRoomName,
  newRoomSection,
  setNewRoomSection,
  newRoomSemester,
  setNewRoomSemester,
  newRoomInstitution,
  setNewRoomInstitution,
  newRoomCode,
  setNewRoomCode,
}) => {
  return (
    <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-[#27272a]">
      <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-950 dark:text-white flex items-center gap-1.5">
        <School className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
        <span>2. Classroom Hub Configuration</span>
      </h4>

      <div>
        <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
          Classroom / Course Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="e.g. B.Tech Computer Science (Batch 2026)"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">Section</label>
          <input
            type="text"
            placeholder="e.g. Section B"
            value={newRoomSection}
            onChange={(e) => setNewRoomSection(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">Semester / Year</label>
          <input
            type="text"
            placeholder="e.g. 5th Sem (3rd Year)"
            value={newRoomSemester}
            onChange={(e) => setNewRoomSemester(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
          University / College / Department
        </label>
        <input
          type="text"
          placeholder="e.g. Oxford Institute of Technology"
          value={newRoomInstitution}
          onChange={(e) => setNewRoomInstitution(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-xs"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
            Classroom Join Code <span className="text-rose-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              const r = `CS-${Math.floor(1000 + Math.random() * 9000)}`;
              setNewRoomCode(r);
            }}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Randomize</span>
          </button>
        </div>
        <input
          type="text"
          required
          placeholder="e.g. CS-4891"
          value={newRoomCode}
          onChange={(e) => setNewRoomCode(e.target.value.toUpperCase())}
          className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl px-3.5 py-2 text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold tracking-widest focus:bg-white dark:focus:bg-[#222226] focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 uppercase transition shadow-xs"
        />
      </div>
    </div>
  );
};
