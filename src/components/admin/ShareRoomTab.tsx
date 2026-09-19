import React from 'react';
import { QrCode, Download, Sparkles, School, Share2, Check, Copy, Shield } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header banner */}
      <div className="bg-white dark:bg-[#0E1424] border border-zinc-200 dark:border-[#1F2A44] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-50 dark:bg-[#161F36] text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 inline-flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5" />
            Invitation & Card Studio
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white mt-1.5">
            Share Classroom Invite Card
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl font-medium">
            Download a high-resolution printable invitation card with your custom QR code, or share direct 1-click links
            to onboard students in seconds.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onDownloadCard}
            disabled={isGeneratingDownload || !qrDataUrl}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-950/20 transition disabled:opacity-40 flex-1 sm:flex-initial cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            {isGeneratingDownload ? 'Rendering...' : 'Download Card (PNG)'}
          </button>
        </div>
      </div>

      {/* Grid Layout: Card Preview (Left) & Share Options (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Printable Card Preview */}
        <div className="lg:col-span-6 bg-white dark:bg-[#0E1424] border border-zinc-200 dark:border-[#1F2A44] rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-sm">
          <div className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            Printable Card Preview
          </div>

          <div className="w-full max-w-sm rounded-3xl bg-zinc-50 dark:bg-[#121A2D] border-2 border-zinc-200 dark:border-indigo-500/30 p-6 text-center shadow-xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#161F36] text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-[#1F2A44] text-[10px] font-bold uppercase tracking-wider shadow-xs">
              <School className="w-3 h-3 text-indigo-500" />
              {classroom.institution}
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white tracking-tight">{classroom.name}</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
                {classroom.section} • {classroom.semester}
              </p>
            </div>

            {/* QR Image Container */}
            <div className="inline-block p-3.5 bg-white dark:bg-[#161F36] rounded-2xl shadow-sm border border-zinc-200 dark:border-[#1F2A44] ring-4 ring-zinc-100 dark:ring-[#0E1424]">
              {qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={qrDataUrl} alt="Classroom QR Code" className="w-48 h-48 mx-auto rounded-lg" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-zinc-400">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Class Code Highlight */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#161F36] border border-zinc-200 dark:border-indigo-500/30 max-w-xs mx-auto space-y-1 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-400">Class Code</div>
              <div className="font-mono text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-wider">{classroom.code}</div>
            </div>

            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto font-medium">
              Scan with phone camera or visit the link to join with your Roll Number!
            </p>
          </div>
        </div>

        {/* Right Column: Actions, Links, and Guidance */}
        <div className="lg:col-span-6 space-y-4">
          {/* 1. Direct Join Link Box */}
          <div className="bg-white dark:bg-[#0E1424] border border-zinc-200 dark:border-[#1F2A44] rounded-3xl p-4 sm:p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-black text-zinc-950 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-500" />
                Direct Share Link
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#161F36] text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-bold flex-shrink-0">
                Auto-fills Code
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              Send this link directly to students. When clicked on mobile or desktop, the classroom code will be filled
              in automatically.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={joinUrl}
                className="flex-1 min-w-0 bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none truncate shadow-xs"
              />
              <button
                onClick={onCopyLink}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition flex-shrink-0 shadow-md shadow-indigo-950/20 active:scale-95 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* 2. Download Card Action */}
          <div className="bg-white dark:bg-[#0E1424] border border-zinc-200 dark:border-[#1F2A44] rounded-3xl p-4 sm:p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-black text-zinc-950 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-500" />
                Downloadable Invitation Card
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#161F36] text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-[#1F2A44] font-bold flex-shrink-0">
                1000 × 1250 PNG
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              Creates an ultra-crisp PNG image card containing your institution details, class title, scannable QR code,
              and class code badge.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                onClick={onDownloadCard}
                disabled={isGeneratingDownload || !qrDataUrl}
                className="w-full sm:flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-950/20 transition disabled:opacity-40 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                {isGeneratingDownload ? 'Generating PNG...' : 'Download Card Image (PNG)'}
              </button>

              <button
                onClick={onNativeShare}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl border border-zinc-200 dark:border-[#1F2A44] bg-zinc-100 dark:bg-[#161F36] hover:bg-zinc-200 dark:hover:bg-[#1F2A44] text-zinc-900 dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Share2 className="w-4 h-4 text-indigo-500" />
                Share Card Link
              </button>
            </div>
          </div>

          {/* 3. Printing Tips */}
          <div className="bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-3xl p-5 space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
            <div className="text-zinc-950 dark:text-white font-black flex items-center gap-1.5 text-xs">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              Classroom Onboarding Tips
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] text-zinc-700 dark:text-zinc-400 font-medium">
              <li>
                <span className="text-zinc-950 dark:text-white font-bold">Classroom Boards:</span> Print the downloaded PNG card and
                post it on your classroom board, student lounge, or department notice board.
              </li>
              <li>
                <span className="text-zinc-950 dark:text-white font-bold">Group Chats:</span> Share the downloaded image card on
                WhatsApp or Telegram class groups.
              </li>
              <li>
                <span className="text-zinc-950 dark:text-white font-bold">Approval Control:</span> In Classroom Settings, toggle{' '}
                <strong className="text-zinc-950 dark:text-white">Require Approval</strong> to manually review each student before
                admitting them.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
