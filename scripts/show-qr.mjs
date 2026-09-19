import QRCode from 'qrcode';
import path from 'path';
import os from 'os';

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

async function main() {
  const localIp = getLocalIp();
  const targetUrl = process.argv[2] || `http://${localIp}:3000`;

  console.log('\n=============================================================');
  console.log('📱 CLASSMATE MOBILE CONNECT & RESPONSIVENESS TEST');
  console.log('=============================================================');
  console.log(`💻 Local Computer URL:   http://localhost:3000`);
  console.log(`📶 Wi-Fi Mobile Network: ${targetUrl}`);
  console.log('=============================================================');
  console.log('📷 SCAN WITH YOUR MOBILE PHONE CAMERA TO TEST ON MOBILE:\n');

  try {
    const asciiQr = await QRCode.toString(targetUrl, {
      type: 'terminal',
      small: true,
    });
    console.log(asciiQr);
  } catch (err) {
    console.log(`Could not generate terminal QR, open directly on phone: ${targetUrl}`);
  }

  try {
    const publicQr = path.join(process.cwd(), 'public', 'mobile_connect_qr.png');
    await QRCode.toFile(publicQr, targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
    });
  } catch {
    // optional
  }

  console.log('=============================================================\n');
}

main().catch(console.error);
