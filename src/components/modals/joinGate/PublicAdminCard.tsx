import React from 'react';
import { Phone, Mail, ShieldCheck } from 'lucide-react';
import { Classroom } from '@/types';

interface PublicAdminCardProps {
  classroom: Classroom | null;
}

export const PublicAdminCard: React.FC<PublicAdminCardProps> = ({ classroom }) => {
  if (!classroom) {
    return null;
  }

  const adminName = classroom.adminName || classroom.adminDesignation || 'Class Representative';
  const adminPhone = classroom.adminPhone || '';
  const adminEmail = classroom.adminEmail || '';

  return (
    <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 shadow-xs space-y-2 text-left animate-in fade-in">
      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
            {classroom.adminDesignation ? `Verified ${classroom.adminDesignation}` : 'Verified Class Representative'}
          </span>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
          👑 Class Rep
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-white text-zinc-900 border border-zinc-200 flex items-center justify-center font-bold text-sm shadow-xs">
          {adminName.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-black text-zinc-950 truncate">
            {adminName}
          </div>
          <div className="text-[10px] text-zinc-500 truncate">
            {classroom.name} {classroom.section ? `• ${classroom.section}` : ''}
          </div>
        </div>
      </div>

      {/* Direct Public Contacts */}
      <div className="pt-2 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        {adminPhone ? (
          <a
            href={`tel:${adminPhone}`}
            className="flex items-center gap-1.5 text-zinc-700 hover:text-black transition"
            title="Contact Class Rep via Phone"
          >
            <Phone className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
            <span className="font-mono text-xs text-zinc-900 font-semibold truncate">{adminPhone}</span>
          </a>
        ) : (
          <span className="text-zinc-400 text-[10px] flex items-center gap-1">
            <Phone className="w-3.5 h-3.5" /> Contact hidden
          </span>
        )}

        {adminEmail && (
          <a
            href={`mailto:${adminEmail}`}
            className="flex items-center gap-1.5 text-zinc-700 hover:text-black transition truncate"
            title="Contact Class Rep via Email"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
            <span className="truncate text-xs text-zinc-900">{adminEmail}</span>
          </a>
        )}
      </div>
    </div>
  );
};
