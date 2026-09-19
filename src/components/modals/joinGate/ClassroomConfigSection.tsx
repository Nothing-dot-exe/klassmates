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
    <div className="space-y-3 pt-2 border-t border-zinc-200">
      <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
        <School className="w-3.5 h-3.5" />
        2. Classroom Hub Configuration
      </h4>

      <div>
        <label className="block text-xs font-medium text-zinc-800 mb-1">
          Classroom / Course Title <span className="text-zinc-900">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="e.g. B.Tech Computer Science (Batch 2026)"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-black transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-800 mb-1">Section</label>
          <input
            type="text"
            placeholder="e.g. Section B"
            value={newRoomSection}
            onChange={(e) => setNewRoomSection(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-black transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-800 mb-1">Semester</label>
          <input
            type="text"
            placeholder="e.g. Semester 6"
            value={newRoomSemester}
            onChange={(e) => setNewRoomSemester(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-black transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-800 mb-1">Institution / Department</label>
        <input
          type="text"
          placeholder="e.g. Dept. of Computer Science & Engineering"
          value={newRoomInstitution}
          onChange={(e) => setNewRoomInstitution(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-black transition"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-800 mb-1">
          Class Room Code (Students will use this to join)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            required
            value={newRoomCode}
            onChange={(e) => setNewRoomCode(e.target.value.toUpperCase())}
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-black font-mono tracking-wider font-bold"
          />
          <button
            type="button"
            onClick={() => setNewRoomCode('CS-' + Math.floor(1000 + Math.random() * 9000))}
            className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Generate new random code"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Random
          </button>
        </div>
      </div>
    </div>
  );
};
