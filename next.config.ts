import type { NextConfig } from "next";
import os from 'os';

function getLocalIpList(): string[] {
  const origins = new Set<string>([
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
    '*.loca.lt',
    '*.trycloudflare.com',
  ]);

  try {
    const nets = os.networkInterfaces();
    for (const interfaces of Object.values(nets)) {
      for (const net of interfaces || []) {
        if (net.family === 'IPv4' && !net.internal) {
          origins.add(net.address);
          origins.add(`${net.address}:3000`);
        }
      }
    }
  } catch {
    // Fallback safely if os network interfaces fail
  }

  return Array.from(origins);
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getLocalIpList(),
  devIndicators: false,
};

export default nextConfig;

