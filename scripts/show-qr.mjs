import QRCode from 'qrcode';
import path from 'path';

const baseUrl = process.argv[2] || 'https://subsection-essays-dig-determination.trycloudflare.com';
const tunnelUrl = baseUrl.includes('?') ? baseUrl : `${baseUrl}?reset=true`;
const localIp = '10.248.203.164';
const localUrl = `http://${localIp}:3000?reset=true`;

async function main() {
  console.log('\n=============================================================');
  console.log('📱 CLASSMATE MOBILE QR CODE CONNECT');
  console.log('=============================================================');
  console.log('🌍 Public HTTPS URL (Works on any mobile network / 4G / 5G / Wi-Fi):');
  console.log(`   ${tunnelUrl}\n`);
  console.log('📶 Local Wi-Fi URL (Same Wi-Fi network):');
  console.log(`   ${localUrl}\n`);
  console.log('📷 SCAN THE QR CODE BELOW WITH YOUR MOBILE CAMERA:');
  console.log('=============================================================\n');

  // Print ASCII QR Code for Terminal
  const asciiQr = await QRCode.toString(tunnelUrl, {
    type: 'terminal',
    small: true
  });
  console.log(asciiQr);

  // Save PNG QR Code to public and artifacts directory
  const publicQr = path.join(process.cwd(), 'public', 'mobile_connect_qr.png');
  await QRCode.toFile(publicQr, tunnelUrl, {
    width: 600,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });

  const artifactDir = 'C:\\Users\\kadam\\.gemini\\antigravity-ide\\brain\\57f90c60-656c-4346-ad5a-3f32054e0cb3';
  const pngPath = path.join(artifactDir, 'mobile_connect_qr.png');
  await QRCode.toFile(pngPath, tunnelUrl, {
    width: 600,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });

  console.log(`\n✅ High-resolution PNG QR saved to: ${pngPath}`);
  console.log('=============================================================\n');
}

main().catch(console.error);
