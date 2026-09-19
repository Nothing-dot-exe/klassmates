import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '10.248.203.164:3000',
    '10.248.203.164',
    'localhost',
    '*.loca.lt',
    '*.trycloudflare.com',
  ],
};

export default nextConfig;
