'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  AlertCircle,
  User as UserIcon,
  Tag,
  BookOpen,
} from 'lucide-react';
import { DocumentItem } from '@/types';

interface PdfViewerModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<boolean>(false);

  // Generate safe blob URL from content/downloadUrl
  useEffect(() => {
    if (!isOpen || !document) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      return;
    }

    setLoadError(false);
    setScale(1);
    setRotation(0);
    setIsFullscreen(false);

    let objectUrl: string | null = null;
    try {
      const rawContent = document.content || document.downloadUrl || '';

      if (rawContent.startsWith('data:application/pdf;base64,')) {
        const base64Data = rawContent.replace('data:application/pdf;base64,', '');
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(blob);
      } else if (rawContent.startsWith('blob:')) {
        objectUrl = rawContent;
      } else if (rawContent.startsWith('http://') || rawContent.startsWith('https://')) {
        objectUrl = rawContent;
      } else if (document.downloadUrl && document.downloadUrl !== '#') {
        objectUrl = document.downloadUrl;
      }
    } catch (e) {
      console.error('Failed to parse PDF content into blob:', e);
      setLoadError(true);
    }

    setBlobUrl(objectUrl);

    return () => {
      if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isOpen, document]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  const handleDownload = () => {
    if (!document) return;
    const url = blobUrl || document.downloadUrl || document.content;
    if (!url || url === '#') return;

    const a = window.document.createElement('a');
    a.href = url;
    a.download = document.fileName || `${document.title}.pdf`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const handleOpenExternal = () => {
    const targetUrl = blobUrl || document?.downloadUrl || document?.content;
    if (targetUrl && targetUrl !== '#') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePrint = () => {
    const targetUrl = blobUrl || document?.downloadUrl;
    if (targetUrl && targetUrl !== '#') {
      const printWindow = window.open(targetUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
      } else {
        window.print();
      }
    } else {
      window.print();
    }
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setScale(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-zinc-950/80 dark:bg-black/90 backdrop-blur-md animate-in fade-in transition-colors">
      <div
        className={`bg-white dark:bg-[#09090b] border-0 sm:border border-zinc-200 dark:border-[#27272a] rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 z-50 rounded-none w-full h-full'
            : 'w-full sm:max-w-5xl h-full sm:h-[92vh]'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2.5 sm:py-3.5 border-b border-zinc-200 dark:border-[#27272a] bg-white/95 dark:bg-[#121214]/95 backdrop-blur-md flex-shrink-0 transition-colors">
          {/* Document Identity */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-zinc-100 dark:bg-[#18181b] text-zinc-900 dark:text-indigo-400 border border-zinc-200 dark:border-[#27272a] flex-shrink-0 shadow-xs">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white truncate max-w-[180px] sm:max-w-md" title={document.title}>
                  {document.title}
                </h3>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-indigo-50 dark:bg-[#222226] text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex-shrink-0">
                  PDF
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                {document.subject && (
                  <span className="flex items-center gap-1 text-zinc-800 dark:text-zinc-200 font-medium truncate">
                    <BookOpen className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                    <span className="truncate">{document.subject}</span>
                  </span>
                )}
                {document.fileSize && (
                  <span className="font-mono text-zinc-400 flex-shrink-0">
                    • {document.fileSize}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Toolbar */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Desktop Zoom Controls */}
            <div className="hidden sm:flex items-center bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl p-0.5">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                title="Zoom Out"
                className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white disabled:opacity-30 rounded-lg hover:bg-zinc-200 dark:hover:bg-[#222226] transition cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                title="Reset Zoom (Fit)"
                className="px-2 py-1 text-[10px] font-mono font-bold text-zinc-950 dark:text-white hover:bg-zinc-200 dark:hover:bg-[#222226] rounded transition cursor-pointer"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 2.5}
                title="Zoom In"
                className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white disabled:opacity-30 rounded-lg hover:bg-zinc-200 dark:hover:bg-[#222226] transition cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Desktop Rotate Button */}
            <button
              onClick={handleRotate}
              title="Rotate 90° Clockwise"
              className="hidden sm:flex p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl hover:bg-zinc-100 dark:hover:bg-[#222226] transition cursor-pointer shadow-xs"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Desktop Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="hidden sm:flex p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl hover:bg-zinc-100 dark:hover:bg-[#222226] transition cursor-pointer shadow-xs"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Desktop Print Button */}
            <button
              onClick={handlePrint}
              title="Print Document"
              className="hidden sm:flex p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl hover:bg-zinc-100 dark:hover:bg-[#222226] transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Open in external tab / browser viewer */}
            {blobUrl && (
              <a
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in new tab"
                className="p-1.5 sm:p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] rounded-xl hover:bg-zinc-100 dark:hover:bg-[#222226] transition shadow-xs flex items-center justify-center cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </a>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              title="Download PDF"
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-950/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              title="Close viewer"
              className="p-1.5 sm:p-2 text-zinc-400 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#222226] rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Mobile quick-open helper banner */}
        {blobUrl && (
          <div className="sm:hidden flex items-center justify-between px-3 py-1.5 bg-indigo-500/10 border-b border-indigo-500/20 text-[11px] text-indigo-400">
            <span>Reading on mobile?</span>
            <button
              onClick={handleOpenExternal}
              className="font-bold underline text-indigo-300 hover:text-white"
            >
              Open in Phone Reader ↗
            </button>
          </div>
        )}

        {/* Viewport Area */}
        <div className="flex-1 bg-zinc-100 dark:bg-[#09090b] p-0 sm:p-4 overflow-hidden flex items-center justify-center relative">
          {loadError || !blobUrl ? (
            <div className="max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-[#27272a] text-center space-y-4 shadow-xl m-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-[#18181b] text-zinc-900 dark:text-amber-400 border border-zinc-200 dark:border-[#27272a] flex items-center justify-center mx-auto shadow-xs">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-950 dark:text-white">Preview Not Directly Embeddable</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  This document cannot be previewed in-browser due to security headers or missing data, but you can download or open it directly in a dedicated tab.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download File
                </button>
                <button
                  onClick={handleOpenExternal}
                  className="px-4 py-2 bg-zinc-100 dark:bg-[#222226] hover:bg-zinc-200 dark:hover:bg-[#27272a] text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 border border-zinc-200 dark:border-[#27272a] cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Tab
                </button>
              </div>
            </div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-200 ease-out origin-center"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                minHeight: scale > 1 ? `${scale * 100}%` : '100%',
                minWidth: scale > 1 ? `${scale * 100}%` : '100%',
              }}
            >
              <object
                data={`${blobUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                type="application/pdf"
                className="w-full h-full border-0 sm:border border-zinc-200 dark:border-zinc-800 sm:rounded-2xl shadow-none sm:shadow-xl bg-white"
              >
                {/* Fallback iframe */}
                <iframe
                  src={`${blobUrl}#toolbar=1`}
                  className="w-full h-full border-0 sm:rounded-2xl"
                  title={document.title}
                >
                  <div className="p-6 text-center text-zinc-700">
                    <p>Your browser does not support PDF frames.</p>
                    <button
                      onClick={handleDownload}
                      className="mt-3 px-4 py-2 rounded-xl bg-zinc-950 text-white text-xs font-bold cursor-pointer"
                    >
                      Download PDF
                    </button>
                  </div>
                </iframe>
              </object>
            </div>
          )}
        </div>

        {/* Footer Meta Strip */}
        <div className="px-3 sm:px-5 py-2 sm:py-2.5 border-t border-zinc-200 dark:border-[#27272a] bg-white/95 dark:bg-[#121214]/95 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 flex-shrink-0 transition-colors">
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-zinc-900 dark:text-zinc-200 font-semibold truncate max-w-[200px] sm:max-w-xs">{document.fileName}</span>
            {document.uploadedAt && <span className="hidden sm:inline">• Uploaded {document.uploadedAt}</span>}
          </div>

          <div className="flex items-center gap-2">
            {document.tags && document.tags.length > 0 && (
              <div className="hidden sm:flex items-center gap-1">
                <Tag className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                {document.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-[#18181b] text-zinc-700 dark:text-zinc-300 font-mono border border-zinc-200 dark:border-[#27272a]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">Press ESC to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
