import { NextResponse } from 'next/server';
import { getActiveNetworkInfo } from '@/lib/server/networkUtils';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const port = url.port || '3000';
    const info = getActiveNetworkInfo(port);

    return NextResponse.json(info, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        localIp: 'localhost',
        isWifi: false,
        adapterName: 'Loopback',
        wifiUrl: 'http://localhost:3000',
        isLocal: false,
      },
      { status: 200 }
    );
  }
}
