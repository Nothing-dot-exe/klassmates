import os from 'os';

function getActiveNetworkIp() {
  const nets = os.networkInterfaces();
  const candidates = [];

  for (const [name, interfaces] of Object.entries(nets)) {
    const lowerName = name.toLowerCase();
    // Skip virtual, loopback, docker, wsl, and virtualbox adapters
    if (
      lowerName.includes('virtual') ||
      lowerName.includes('vethernet') ||
      lowerName.includes('pseudo') ||
      lowerName.includes('loopback') ||
      lowerName.includes('docker')
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
        // Prioritize Wi-Fi or WLAN
        const isWifi = lowerName.includes('wi-fi') || lowerName.includes('wireless') || lowerName.includes('wlan');
        candidates.push({ name, ip: net.address, isWifi });
      }
    }
  }

  // Sort Wi-Fi first, then Ethernet
  candidates.sort((a, b) => (b.isWifi ? 1 : 0) - (a.isWifi ? 1 : 0));
  return candidates[0]?.ip || 'localhost';
}

const networkIp = getActiveNetworkIp();

console.log('\n=============================================================');
console.log('    iClassmates — Student Workspace & Academic Hub');
console.log('=============================================================');
console.log('');
console.log('  Local Computer URL : http://localhost:3000');
if (networkIp !== 'localhost') {
  console.log(`  Mobile Phone URL   : http://${networkIp}:3000`);
}
console.log('');
console.log('  [Instructions for Mobile Phone]:');
console.log('  1. Connect your phone to the same Wi-Fi network as this PC.');
if (networkIp !== 'localhost') {
  console.log(`  2. On your phone browser (Chrome/Safari), open:`);
  console.log(`     http://${networkIp}:3000`);
}
console.log('=============================================================\n');
