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
      <div className="text-[10px] font-bold text-zinc-400 dark:text-[#858585] uppercase tracking-wider px-3 pb-1 flex items-center justify-between">
        <span>Group Channels</span>
        <span className="text-zinc-400 dark:text-[#858585]">#{channels.length}</span>
      </div>

      {channels.map((ch) => {
        const isSelected = activeView === 'channel' && selectedChannelId === ch.id;
        return (
          <button
            key={ch.id}
            onClick={() => onSelectChannel(ch.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${isSelected
                ? 'bg-zinc-950 dark:bg-[#37373d] text-white dark:border-l-2 dark:border-[#007acc] shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-[#858585] hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#2a2d2e]'
              }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Hash className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-zinc-300 dark:text-[#007acc]' : 'text-zinc-400 dark:text-[#858585]'}`} />
              <span className="truncate">{ch.name}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
