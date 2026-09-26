import net from 'net';
import { exec } from 'child_process';

const candidatePorts = [3000, 3001, 3002];
let attempts = 0;
const maxAttempts = 50; // 50 * 250ms = 12.5s max

function isPortListening(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let hasResolved = false;

    socket.setTimeout(200);

    socket.on('connect', () => {
      if (!hasResolved) {
        hasResolved = true;
        socket.destroy();
        resolve(true);
      }
    });

    socket.on('timeout', () => {
      if (!hasResolved) {
        hasResolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.on('error', () => {
      if (!hasResolved) {
        hasResolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.connect(port, '127.0.0.1');
  });
}

function openBrowser(url) {
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  if (isWindows) {
    exec(`cmd /c start ${url}`);
  } else if (isMac) {
    exec(`open ${url}`);
  } else {
    exec(`xdg-open ${url}`);
  }
}

async function poll() {
  for (const port of candidatePorts) {
    const ready = await isPortListening(port);
    if (ready) {
      const url = `http://localhost:${port}`;
      console.log(`\n  [SUCCESS] iClassmates server is active at ${url}`);
      console.log(`  Opening browser: ${url}\n`);
      openBrowser(url);
      process.exit(0);
    }
  }

  attempts++;
  if (attempts < maxAttempts) {
    setTimeout(poll, 250);
  } else {
    console.log(`\n  [INFO] Opening default URL http://localhost:3000 ...\n`);
    openBrowser('http://localhost:3000');
    process.exit(0);
  }
}

poll();

