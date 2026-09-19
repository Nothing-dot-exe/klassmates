'use client';

import React from 'react';
import { MessageReaction } from '@/types';

interface MessageReactionsBarProps {
  reactions?: MessageReaction[];
  currentUserId: string;
  isMine: boolean;
  onReact: (emoji: string) => void;
}

export const MessageReactionsBar: React.FC<MessageReactionsBarProps> = ({
  reactions,
  currentUserId,
  isMine,
  onReact,
}) => {
  const displayReactions = (reactions || []).filter((r) => r.emoji !== '▲' && r.emoji !== '▼');
  if (displayReactions.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-1 -mt-2 z-10 ${
        isMine ? 'mr-1 justify-end' : 'ml-1 justify-start'
      }`}
    >
      {displayReactions.map((r, i) => (
        <button
          key={i}
          onClick={() => onReact(r.emoji)}
          className={`px-1.5 py-0.2 rounded-full text-[11px] flex items-center gap-1 border shadow-xs transition-transform active:scale-95 cursor-pointer ${
            r.users.includes(currentUserId)
              ? 'bg-zinc-950 border-zinc-950 text-white'
              : 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-100'
          }`}
        >
          <span>{r.emoji}</span>
          <span className="text-[9px] font-bold">{r.count}</span>
        </button>
      ))}
    </div>
  );
};
