'use client';

import React from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Classroom & Study',
    emojis: ['📚', '📖', '📝', '💡', '🧠', '🎓', '🔬', '💻', '⚡', '🎯', '🔥', '✨']
  },
  {
    name: 'Reactions & Gestures',
    emojis: ['👍', '🙌', '👏', '🤝', '❤️', '💯', '✅', '🚀', '🎉', '👀', '🤔', '😎']
  },
  {
    name: 'Smiles & Faces',
    emojis: ['😀', '😂', '😊', '🥳', '😴', '🤯', '😭', '🤩', '🤓', '🫡', '☕', '🌧️']
  }
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  return (
    <div className="absolute bottom-14 right-4 z-50 w-72 bg-white border border-zinc-200 rounded-2xl shadow-xl p-3 backdrop-blur-xl animate-in fade-in zoom-in-95">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Class Emojis</span>
        <button
          onClick={onClose}
          className="text-xs text-zinc-400 hover:text-zinc-800 px-1.5 py-0.5 rounded hover:bg-zinc-100 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-1 no-scrollbar">
        {EMOJI_CATEGORIES.map((cat) => (
          <div key={cat.name}>
            <div className="text-[11px] font-medium text-zinc-500 mb-1">{cat.name}</div>
            <div className="grid grid-cols-6 gap-1">
              {cat.emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onSelect(emoji)}
                  className="h-8 w-8 flex items-center justify-center text-lg rounded-lg hover:bg-zinc-100 hover:scale-110 transition-transform active:scale-95 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
