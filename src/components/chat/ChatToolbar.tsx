import React, { useState } from 'react';
import { ShieldCheck, Clock, FileCode } from 'lucide-react';
import { AutoDeleteOption } from '@/types';

interface ChatToolbarProps {
  autoDelete: AutoDeleteOption;
  setAutoDelete: (val: AutoDeleteOption) => void;
  onShareQuickMarkdown: () => void;
}

export const ChatToolbar: React.FC<ChatToolbarProps> = ({
  autoDelete,
  setAutoDelete,
  onShareQuickMarkdown,
}) => {
  const [showTimerMenu, setShowTimerMenu] = useState(false);

  return (
    <div className="flex items-center justify-between pb-2 text-[11px] text-zinc-500">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-zinc-900 font-medium bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200 shadow-xs">
          <ShieldCheck className="w-3 h-3 text-zinc-900" />
          AES-256 E2EE Protected
        </span>

        {/* Disappearing Message Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowTimerMenu(!showTimerMenu)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition cursor-pointer shadow-xs ${
              autoDelete !== 'off'
                ? 'bg-zinc-950 border-zinc-950 text-white font-semibold'
                : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Auto-delete: {autoDelete === 'off' ? 'Off' : autoDelete}</span>
          </button>

          {showTimerMenu && (
            <div className="absolute bottom-7 left-0 z-50 w-36 bg-white border border-zinc-200 rounded-xl shadow-xl p-1.5 space-y-1 animate-in fade-in">
              {(['off', '24h', '7d'] as AutoDeleteOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setAutoDelete(opt);
                    setShowTimerMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    autoDelete === opt
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                  }`}
                >
                  {opt === 'off' ? 'Permanent (Off)' : opt === '24h' ? '24 Hours' : '7 Days'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onShareQuickMarkdown}
        className="text-xs text-zinc-900 hover:text-zinc-700 flex items-center gap-1 font-semibold hover:underline cursor-pointer"
      >
        <FileCode className="w-3.5 h-3.5" />
        Share Markdown Note
      </button>
    </div>
  );
};
