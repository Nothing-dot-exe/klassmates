'use client';

import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Download, Share2, Wifi, Globe, Smartphone, School } from 'lucide-react';
import { Classroom } from '@/types';
import { useShareableInvite } from '@/hooks/useShareableInvite';
import { generateInviteCardPng } from '@/lib/cardGenerator';

interface ShareRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom;
}

export const ShareRoomModal: React.FC<ShareRoomModalProps> = ({
  isOpen,
  onClose,
  classroom,
}) => {
  const {
    joinUrl,
    qrDataUrl,
    isLocalhost,
    localIp,
    copiedLink,
    copiedCode,
    copyLink,
    copyCode,
  } = useShareableInvite(classroom.code);

  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownloadCard = async () => {
    if (!qrDataUrl || isDownloading) return;
    try {
      setIsDownloading(true);
      const dataUrl = await generateInviteCardPng(classroom, joinUrl, qrDataUrl);
      const link = document.createElement('a');
      link.download = `${classroom.name.replace(/\s+/g, '_')}_Invite_Card.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download invite card:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${classroom.name} on Classmate`,
          text: `Join our classroom ${classroom.name} (${classroom.section}) on Classmate!\nClass Code: ${classroom.code}\nLink: ${joinUrl}`,
          url: joinUrl,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-card border border-card-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-card-border flex items-center justify-between bg-card-muted/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-foreground font-display tracking-tight">
                Classroom QR Code & Invite
              </h3>
              <p className="text-xs text-muted">
                Scan with any phone camera to join instantly
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-card-muted transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Network Connection Badge */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-card-muted border border-card-border">
            <div className="flex items-center gap-2 min-w-0">
              {isLocalhost ? (
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                  <Wifi className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                  <span>{isLocalhost ? 'Local Wi-Fi Network Active' : 'Cloud Production Origin'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </div>
                <p className="text-[11px] text-muted truncate">
                  {isLocalhost && localIp
                    ? `Configured for mobile devices on same Wi-Fi (${localIp})`
                    : 'Accessible from any browser on any device'}
                </p>
              </div>
            </div>
          </div>

          {/* Central QR Code Card */}
          <div className="flex flex-col items-center justify-center p-5 bg-card-muted rounded-2xl border border-card-border text-center space-y-3">
            {classroom.institution && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card text-foreground border border-card-border text-xs font-bold uppercase tracking-wider">
                <School className="w-3.5 h-3.5 text-indigo-500" />
                <span>{classroom.institution}</span>
              </div>
            )}

            <div>
              <h4 className="text-lg font-black text-foreground font-display">
                {classroom.name}
              </h4>
              <p className="text-xs text-muted font-medium">
                {classroom.section} • {classroom.semester}
              </p>
            </div>

            {/* High-Resolution QR Canvas / Image */}
            <div className="p-3 bg-white rounded-2xl shadow-md border border-zinc-200">
              {qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${classroom.name}`}
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-zinc-400">
                  Rendering QR Code…
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted">
              <Smartphone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Point phone camera at this QR code to join</span>
            </div>
          </div>

          {/* Class Code Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Class Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-card-muted border border-card-border rounded-xl px-4 py-2.5 font-mono text-base font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
                {classroom.code}
              </div>
              <button
                type="button"
                onClick={copyCode}
                className="px-4 py-2.5 rounded-xl bg-card-muted hover:bg-card border border-card-border text-foreground text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Direct Invite Link Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Direct Invitation Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={joinUrl}
                className="flex-1 min-w-0 bg-card-muted border border-card-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-medium text-foreground truncate focus:outline-none"
              />
              <button
                type="button"
                onClick={copyLink}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950/20 transition active:scale-95 cursor-pointer shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-card-border bg-card-muted/50 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadCard}
            disabled={!qrDataUrl || isDownloading}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-40 cursor-pointer shadow-md active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Rendering Card…' : 'Download Invite Card (PNG)'}</span>
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-card-border bg-card hover:bg-card-muted text-foreground text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            <Share2 className="w-4 h-4 text-indigo-500" />
            <span>Share Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};
