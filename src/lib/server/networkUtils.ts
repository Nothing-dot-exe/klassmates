import os from 'os';

export interface NetworkInfo {
  localIp: string;
  isWifi: boolean;
  adapterName: string;
  wifiUrl: string;
  isLocal: boolean;
}

/**
 * Discovers the active LAN/Wi-Fi IPv4 address of this machine
 * so phones on the same Wi-Fi can connect directly without localhost issues.
 */
export function getActiveNetworkInfo(port: string | number = 3000): NetworkInfo {
  const nets = os.networkInterfaces();
  const candidates: { name: string; ip: string; isWifi: boolean }[] = [];

  for (const [name, interfaces] of Object.entries(nets)) {
    const lowerName = name.toLowerCase();
    // Exclude virtual/container adapters
    if (
      lowerName.includes('virtual') ||
      lowerName.includes('vethernet') ||
      lowerName.includes('pseudo') ||
      lowerName.includes('loopback') ||
      lowerName.includes('docker') ||
      lowerName.includes('wsl')
    ) {
      continue;
    }

    for (const net of interfaces || []) {
      if (
        net.family === 'IPv4' &&
        !net.internal &&
        !net.address.startsWith('192.168.56.') && // VirtualBox host-only
        !net.address.startsWith('169.254.') // APIPA autoconfig
      ) {
        const isWifi =
          lowerName.includes('wi-fi') ||
          lowerName.includes('wifi') ||
          lowerName.includes('wireless') ||
          lowerName.includes('wlan');
        candidates.push({ name, ip: net.address, isWifi });
      }
    }
  }

  // Prioritize active Wi-Fi adapters first, then Ethernet
  candidates.sort((a, b) => (b.isWifi ? 1 : 0) - (a.isWifi ? 1 : 0));

  const bestCandidate = candidates[0];
  const localIp = bestCandidate?.ip || 'localhost';
  const isLocal = localIp !== 'localhost';
  const wifiUrl = isLocal ? `http://${localIp}:${port}` : `http://localhost:${port}`;

  return {
    localIp,
    isWifi: Boolean(bestCandidate?.isWifi),
    adapterName: bestCandidate?.name || 'Local Loopback',
    wifiUrl,
    isLocal,
  };
}
