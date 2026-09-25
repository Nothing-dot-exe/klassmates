import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';

interface UseShareableInviteReturn {
  joinUrl: string;
  qrDataUrl: string;
  isWifi: boolean;
  localIp: string;
  isLocalhost: boolean;
  copiedLink: boolean;
  copiedCode: boolean;
  copyLink: () => Promise<boolean>;
  copyCode: () => Promise<boolean>;
}

export function useShareableInvite(classCode: string): UseShareableInviteReturn {
  const [joinUrl, setJoinUrl] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isWifi, setIsWifi] = useState<boolean>(false);
  const [localIp, setLocalIp] = useState<string>('');
  const [isLocalhost, setIsLocalhost] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const resolveUrlAndGenerateQr = async () => {
      if (typeof window === 'undefined') return;

      const hostname = window.location.hostname;
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
      if (isMounted) setIsLocalhost(isLocal);

      let effectiveOrigin = window.location.origin;

      if (isLocal) {
        try {
          const res = await fetch('/api/network-info');
          if (res.ok) {
            const data = await res.json();
            if (data.wifiUrl && data.localIp && data.localIp !== 'localhost') {
              effectiveOrigin = data.wifiUrl;
              if (isMounted) {
                setLocalIp(data.localIp);
                setIsWifi(Boolean(data.isWifi));
              }
            }
          }
        } catch {
          // Fall back gracefully to window.location.origin
        }
      }

      const encodedCode = encodeURIComponent(classCode.trim().toUpperCase());
      const fullUrl = `${effectiveOrigin}/?code=${encodedCode}`;

      if (isMounted) {
        setJoinUrl(fullUrl);
      }

      try {
        const qr = await QRCode.toDataURL(fullUrl, {
          width: 360,
          margin: 1.5,
          color: {
            dark: '#0a0a0c',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        });
        if (isMounted) {
          setQrDataUrl(qr);
        }
      } catch (err) {
        console.error('Failed to generate invite QR code:', err);
      }
    };

    resolveUrlAndGenerateQr();

    return () => {
      isMounted = false;
    };
  }, [classCode]);

  const copyLink = useCallback(async () => {
    if (!joinUrl) return false;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, [joinUrl]);

  const copyCode = useCallback(async () => {
    if (!classCode) return false;
    try {
      await navigator.clipboard.writeText(classCode.trim().toUpperCase());
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, [classCode]);

  return {
    joinUrl,
    qrDataUrl,
    isWifi,
    localIp,
    isLocalhost,
    copiedLink,
    copiedCode,
    copyLink,
    copyCode,
  };
}
