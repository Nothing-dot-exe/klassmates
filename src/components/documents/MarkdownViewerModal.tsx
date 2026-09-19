'use client';

import React, { useState } from 'react';
import { X, FileText, Download, Copy, Check, Sparkles } from 'lucide-react';
import { DocumentItem } from '@/types';
import { MarkdownContentRenderer } from './MarkdownContentRenderer';

interface MarkdownViewerModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MarkdownViewerModal: React.FC<MarkdownViewerModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [copiedRaw, setCopiedRaw] = useState(false);

  if (!isOpen || !document) return null;

  const handleCopyRaw = () => {
    if (document.content) {
      navigator.clipboard.writeText(document.content);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([document.content || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = document.fileName;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#0E1424] border border-zinc-200 dark:border-[#1F2A44] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-[#1F2A44] bg-white/95 dark:bg-[#0E1424]/95 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-[#121A2D] text-zinc-900 dark:text-indigo-400 border border-zinc-200 dark:border-[#1F2A44] flex-shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-950 dark:text-white truncate">{document.title}</h3>
                <span className="text-[10px] bg-zinc-100 dark:bg-[#161F36] text-zinc-700 dark:text-indigo-400 border border-zinc-300 dark:border-indigo-500/30 px-2 py-0.5 rounded-full font-mono uppercase font-bold flex-shrink-0">
                  {document.fileType}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                {document.subject} • Shared by {document.uploaderName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRaw}
              className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-[#161F36] transition cursor-pointer"
              title="Copy Raw Markdown"
            >
              {copiedRaw ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-[#161F36] transition cursor-pointer"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-[#161F36] transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto no-scrollbar space-y-6 flex-1 bg-[#fafafa] dark:bg-[#080C15] transition-colors">
          {/* Metadata banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0E1424] border border-zinc-200 dark:border-[#1F2A44] text-xs text-zinc-600 dark:text-zinc-400 shadow-2xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">File Name</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-200 font-semibold">{document.fileName}</span>
              </div>
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-bold">File Size</span>
                <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{document.fileSize}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {document.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-[#121A2D] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-[#1F2A44] text-[10px] font-medium font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Rendered Document */}
          <div className="max-w-none">
            <MarkdownContentRenderer
              content={document.content || ''}
              copiedCodeIndex={copiedCodeIndex}
              onCopyCode={handleCopyCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
