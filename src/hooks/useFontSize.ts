'use client';

import { useState, useEffect } from 'react';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

export const FONT_SIZE_MAP: Record<FontSize, { label: string; desc: string; msgClass: string; previewPx: number }> = {
  small:  { label: 'Small',   desc: '13px — compact view',      msgClass: 'text-[13px]',   previewPx: 13 },
  medium: { label: 'Medium',  desc: '15px — comfortable (default)', msgClass: 'text-[15px]', previewPx: 15 },
  large:  { label: 'Large',   desc: '17px — easy reading',      msgClass: 'text-[17px]',   previewPx: 17 },
  xlarge: { label: 'X-Large', desc: '20px — maximum clarity',   msgClass: 'text-[20px]',   previewPx: 20 },
};

const LS_KEY = 'classmate_font_size';

export function useFontSize() {
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY) as FontSize | null;
    if (stored && FONT_SIZE_MAP[stored]) setFontSizeState(stored);
  }, []);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem(LS_KEY, size);
  };

  return { fontSize, setFontSize };
}
