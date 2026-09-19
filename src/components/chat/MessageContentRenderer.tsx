'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface MessageContentRendererProps {
  content: string;
  isMine: boolean;
  chatMode?: 'channel' | 'dm';
}

interface ContentSegment {
  type: 'text' | 'code_block';
  text?: string;
  language?: string;
  code?: string;
}

export const MessageContentRenderer: React.FC<MessageContentRendererProps> = ({
  content,
  isMine,
  chatMode = 'channel',
}) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  if (!content) return null;

  // Split content by triple backticks code blocks: ```lang ... ```
  const segments: ContentSegment[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: content.substring(lastIndex, match.index),
      });
    }
    segments.push({
      type: 'code_block',
      language: match[1]?.trim() || 'code',
      code: match[2]?.trimEnd() || '',
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      text: content.substring(lastIndex),
    });
  }

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  /**
   * Parses inline text for markdown formatting: bold (**text**), inline code (`code`), and clickable URLs
   */
  const renderInlineFormatted = (text: string) => {
    // Regex matching URLs, bold (**text**), or inline code (`code`)
    const tokenRegex = /(https?:\/\/[^\s]+)|(\*\*[^*]+\*\*)|(`[^`]+`)/g;
    const parts: React.ReactNode[] = [];
    let curIdx = 0;
    let m;

    while ((m = tokenRegex.exec(text)) !== null) {
      if (m.index > curIdx) {
        parts.push(text.substring(curIdx, m.index));
      }

      const raw = m[0];
      if (m[1]) {
        // URL
        parts.push(
          <a
            key={m.index}
            href={raw}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-0.5 underline font-medium hover:opacity-80 transition ${
              isMine && chatMode === 'dm'
                ? 'text-white hover:text-zinc-200'
                : 'text-zinc-950 dark:text-[#4fc1ff] underline hover:text-zinc-700 dark:hover:text-[#9cdcfe]'
            }`}
          >
            <span className="truncate max-w-xs">{raw}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-80 inline ml-0.5" />
          </a>
        );
      } else if (m[2]) {
        // Bold
        const boldText = raw.slice(2, -2);
        parts.push(
          <strong key={m.index} className="font-bold">
            {boldText}
          </strong>
        );
      } else if (m[3]) {
        // Inline code
        const codeText = raw.slice(1, -1);
        parts.push(
          <code
            key={m.index}
            className={`font-mono text-[12.5px] px-1.5 py-0.5 rounded ${
              isMine && chatMode === 'dm'
                ? 'bg-white/20 text-white'
                : 'bg-zinc-100 dark:bg-[#2d2d2d] text-zinc-900 dark:text-[#ce9178] border border-zinc-200 dark:border-[#3c3c3c]'
            }`}
          >
            {codeText}
          </code>
        );
      }

      curIdx = m.index + raw.length;
    }

    if (curIdx < text.length) {
      parts.push(text.substring(curIdx));
    }

    return parts;
  };

  return (
    <div className="space-y-2">
      {segments.map((seg, idx) => {
        if (seg.type === 'code_block' && seg.code) {
          const isCopied = copiedCodeIdx === idx;
          return (
            <div
              key={idx}
              className="my-2 rounded-xl overflow-hidden border border-zinc-200 dark:border-[#3c3c3c] bg-zinc-950 shadow-xs text-left select-text"
            >
              {/* Code Card Header */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5 font-mono uppercase font-bold text-zinc-200 tracking-wider">
                  <Terminal className="w-3.5 h-3.5 text-zinc-300" />
                  <span>{seg.language}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(seg.code || '', idx)}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Body */}
              <pre className="p-3 text-[12.5px] font-mono text-zinc-200 leading-relaxed overflow-x-auto no-scrollbar whitespace-pre">
                <code>{seg.code}</code>
              </pre>
            </div>
          );
        }

        // Standard text segment with inline formatting & link detection
        return (
          <div
            key={idx}
            className={`text-[14.5px] sm:text-[15px] leading-[1.4] tracking-[-0.01em] whitespace-pre-wrap break-words ${
              isMine && chatMode === 'dm' ? 'text-white' : 'text-zinc-900 dark:text-[#cccccc]'
            }`}
          >
            {renderInlineFormatted(seg.text || '')}
          </div>
        );
      })}
    </div>
  );
};
