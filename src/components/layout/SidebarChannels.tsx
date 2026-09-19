import React from 'react';
import { Hash } from 'lucide-react';
import { Channel } from '@/types';

interface SidebarChannelsProps {
  channels: Channel[];
  selectedChannelId: string;
  activeView: string;
  onSelectChannel: (channelId: string) => void;
}

export const SidebarChannels: React.FC<SidebarChannelsProps> = ({
  channels,
  selectedChannelId,
  activeView,
  onSelectChannel,
}) => {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider px-2 pb-1 flex items-center justify-between">
        <span>Group Channels</span>
        <span className="font-mono text-xs font-semibold text-slate-400 dark:text-zinc-400">#{channels.length}</span>
      </div>

      {channels.map((ch) => {
        const isSelected = activeView === 'channel' && selectedChannelId === ch.id;
        return (
          <button
            key={ch.id}
            onClick={() => onSelectChannel(ch.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isSelected
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-200 shadow-glow-purple'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className={`font-mono text-sm font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                #
              </span>
              <span className="truncate">{ch.name}</span>
            </div>
            {isSelected && (
              <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366F1]" />
            )}
          </button>
        );
      })}
    </div>
  );
};
