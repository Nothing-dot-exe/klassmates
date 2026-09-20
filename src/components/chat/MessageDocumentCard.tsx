'use client';

import React from 'react';
import { FileText, Sparkles, Eye, Download } from 'lucide-react';
import { DocumentItem } from '@/types';
import { sanitizeUrl } from '@/lib/security/urlSanitizer';

interface MessageDocumentCardProps {
  document: DocumentItem;
  isMine: boolean;
  onOpenDocument: (doc: DocumentItem) => void;
}

export const MessageDocumentCard: React.FC<MessageDocumentCardProps> = ({
  document,
  isMine,
  onOpenDocument,
}) => {
  const handleDownload = () => {
    let url = document.downloadUrl && document.downloadUrl !== '#' ? document.downloadUrl : '';
    if (!url && document.content) {
      if (document.content.startsWith('data:')) {
        url = document.content;
      } else {
        const mimeType = document.fileType === 'pdf' ? 'application/pdf' : 'text/plain;charset=utf-8';
        const blob = new Blob([document.content], { type: mimeType });
        url = URL.createObjectURL(blob);
      }
    }
    const safeUrl = sanitizeUrl(url);
    if (safeUrl && safeUrl !== '#') {
      const a = window.document.createElement('a');
      a.href = safeUrl;
      a.download = document.fileName || `${document.title}.${document.fileType === 'pdf' ? 'pdf' : 'txt'}`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <div className="p-1 sm:p-1.5 max-w-md">
      <div
        className={`p-3.5 rounded-2xl border shadow-xs space-y-2.5 transition-all ${
          isMine
            ? 'bg-zinc-900 border-zinc-700 text-white'
            : 'bg-zinc-50 border-zinc-200 text-zinc-900'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2 rounded-xl flex-shrink-0 border ${
                isMine
                  ? 'bg-zinc-800 text-white border-zinc-700'
                  : 'bg-zinc-200 text-zinc-900 border-zinc-300'
              }`}
            >
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className={`text-xs font-bold line-clamp-1 truncate ${isMine ? 'text-white' : 'text-zinc-950'}`} title={document.title}>
                {document.title}
              </h4>
              <span className={`text-[10px] font-mono ${isMine ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {document.fileName} • {document.fileSize}
              </span>
            </div>
          </div>

          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${
              isMine
                ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                : 'bg-white text-zinc-800 border-zinc-300'
            }`}
          >
            {document.fileType}
          </span>
        </div>

        <div className={`flex items-center justify-between pt-2 border-t ${isMine ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <span className={`text-[10px] font-medium flex items-center gap-1 ${isMine ? 'text-zinc-300' : 'text-zinc-600'}`}>
            <Sparkles className="w-3 h-3 flex-shrink-0" />
            <span>Indexed in Vault</span>
          </span>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {document.fileType === 'pdf' ? (
              <button
                type="button"
                onClick={() => onOpenDocument(document)}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>View PDF</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenDocument(document)}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>Read Note</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              title="Download file"
              className={`p-1.5 rounded-lg transition active:scale-95 cursor-pointer border ${
                isMine
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
              }`}
            >
              <Download className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
