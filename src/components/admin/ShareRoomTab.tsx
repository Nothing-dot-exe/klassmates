import React from 'react';
import { Download, School, Share2, Check, Copy, QrCode } from 'lucide-react';
import { Classroom } from '@/types';

interface ShareRoomTabProps {
  classroom: Classroom;
  qrDataUrl: string;
  joinUrl: string;
  copiedLink: boolean;
  isGeneratingDownload: boolean;
  onCopyLink: () => void;
  onDownloadCard: () => void;
  onNativeShare: () => void;
}

export const ShareRoomTab: React.FC<ShareRoomTabProps> = ({
  classroom,
  qrDataUrl,
  joinUrl,
  copiedLink,
  isGeneratingDownload,
  onCopyLink,
  onDownloadCard,
  onNativeShare,
}) => {
  return (
    <div className="bg-card dark:bg-card border border-card-border dark:border-card-border rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-card-border dark:border-card-border">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-50 dark:bg-[#24302c] text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 inline-flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5" />
            Classroom Invite & QR
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white mt-1">
            Share Classroom
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium mt-0.5">
            Scan the QR code to join instantly, download the invite card, or share the direct link.
          </p>
        </div>
      </div>

      {/* Unified Mixed Grid: QR Preview + Link & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center mt-6">
        {/* Left: QR Code & Classroom Card */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[280px] rounded-2xl bg-card-muted border border-card-border dark:border-card-border p-5 text-center shadow-md space-y-3">
            {/* Institution Badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-background dark:bg-[#24302c] text-zinc-800 dark:text-zinc-200 border border-card-border dark:border-card-border text-[10px] font-bold uppercase tracking-wider truncate max-w-full">
              <School className="w-3 h-3 text-indigo-500 shrink-0" />
              <span className="truncate">{classroom.institution}</span>
            </div>

            <div>
              <h4 className="text-base font-black text-zinc-950 dark:text-white tracking-tight truncate">
                {classroom.name}
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                {classroom.section} • {classroom.semester}
              </p>
            </div>

            {/* QR Code */}
            <div className="p-3 bg-white dark:bg-white rounded-xl shadow-xs border border-zinc-200 inline-block">
              {qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrDataUrl}
                  alt="Classroom QR Code"
                  className="w-40 h-40 object-contain mx-auto"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-xs text-zinc-400">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Class Code Highlight */}
            <div className="py-2 px-3 rounded-xl bg-background dark:bg-[#24302c] border border-card-border dark:border-indigo-500/30 text-center">
              <div className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                Class Code
              </div>
              <div className="font-mono text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
                {classroom.code}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Direct Link & Single Action Controls */}
        <div className="md:col-span-7 space-y-5">
          {/* Share Link Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                Direct Invite Link
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#24302c] text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-500/30">
                Auto-fills Code
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={joinUrl}
                className="flex-1 min-w-0 bg-card-muted border border-card-border dark:border-card-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none truncate shadow-xs"
              />
              <button
                onClick={onCopyLink}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shrink-0 shadow-md shadow-indigo-950/20 active:scale-95 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            {joinUrl && !joinUrl.includes('localhost') && !joinUrl.includes('127.0.0.1') && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>Same Wi-Fi Ready: Mobile phones connected to your Wi-Fi can scan this QR code or open this link to join directly!</span>
              </div>
            )}
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              Share this link with students. When opened, it automatically selects your class and fills in the class code.
            </p>
          </div>

          {/* Action Buttons: Download Card & Share */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onDownloadCard}
              disabled={isGeneratingDownload || !qrDataUrl}
              className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-950/20 transition disabled:opacity-40 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              {isGeneratingDownload ? 'Rendering Card...' : 'Download Card (PNG)'}
            </button>

            <button
              onClick={onNativeShare}
              className="w-full sm:w-auto py-3 px-5 rounded-xl border border-card-border dark:border-card-border bg-card-muted hover:bg-zinc-50 dark:hover:bg-[#24302c] text-zinc-800 dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-95"
            >
              <Share2 className="w-4 h-4 text-indigo-500" />
              Share Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
