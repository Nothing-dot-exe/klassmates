'use client';

import React from 'react';
import { Download, Trash2, X, FileText, AlertCircle } from 'lucide-react';
import { ChatMessage } from '@/types';

interface ClearChatModalProps {
  isOpen: boolean;
  conversationTitle: string;
  messages: ChatMessage[];
  onClose: () => void;
  onClear: () => void;
}

export const ClearChatModal: React.FC<ClearChatModalProps> = ({
  isOpen,
  conversationTitle,
  messages,
  onClose,
  onClear,
}) => {
  if (!isOpen) return null;

  const downloadBackupFile = () => {
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const lines = messages.map((m) => {
        const replyTag = m.replyTo ? ` [Replying to ${m.replyTo.senderName}: "${m.replyTo.content}"]` : '';
        return `[${m.timestamp}] ${m.senderName} (${m.senderRollNo})${replyTag}: ${m.content || (m.imageUrl ? '[Photo]' : '[Attachment]')}`;
      });

      const backupContent = `=== CLASSMATE CHAT BACKUP ===\nConversation: ${conversationTitle}\nExport Date: ${new Date().toLocaleString()}\nTotal Messages: ${messages.length}\n=============================\n\n${lines.join('\n')}`;

      const blob = new Blob([backupContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `classmate_${conversationTitle.replace(/[^a-z0-9]/gi, '_')}_backup_${dateStr}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export chat backup:', err);
    }
  };

  const handleBackupAndClear = () => {
    downloadBackupFile();
    onClear();
    onClose();
  };

  const handleClearDirectly = () => {
    onClear();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0E1424] border border-zinc-200 dark:border-[#1F2A44] p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-[#161F36] border border-zinc-200 dark:border-[#1F2A44] text-zinc-900 dark:text-indigo-400 shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Clear Chat History?</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{conversationTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#161F36] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Card */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-white">
            <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span>Do you want to save a backup before deleting?</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            You have <strong className="text-zinc-950 dark:text-white font-bold">{messages.length} messages</strong> in this chat. We can automatically export a complete, clean text backup to your device.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleBackupAndClear}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-95 active:scale-95 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-glow-purple cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup &amp; Clear</span>
          </button>

          <button
            type="button"
            onClick={handleClearDirectly}
            className="w-full py-2.5 px-4 rounded-2xl bg-zinc-100 dark:bg-[#161F36] hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-95 text-zinc-800 dark:text-zinc-300 hover:text-rose-700 dark:hover:text-rose-400 border border-zinc-200 dark:border-[#1F2A44] hover:border-rose-200 dark:hover:border-rose-800/40 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Without Backup</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
