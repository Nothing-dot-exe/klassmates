import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ITERATIONS = 100000;
const KEY_LENGTH = 32; // 256 bits
const HASH_PREFIX = 'pbkdf2';

function serverHash(password: string): string {
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  return `${HASH_PREFIX}:${ITERATIONS}:${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

function serverVerify(password: string, storedHash: string): boolean {
  if (!storedHash || !password) return false;
  if (!storedHash.startsWith(`${HASH_PREFIX}:`)) {
    return password === storedHash;
  }

  const parts = storedHash.split(':');
  if (parts.length !== 4) return false;

  const iterations = parseInt(parts[1], 10);
  const salt = Buffer.from(parts[2], 'hex');
  const expectedHashHex = parts[3];

  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, expectedHashHex.length / 2, 'sha256');
  return derivedKey.toString('hex') === expectedHashHex;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, password, storedHash } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid password' }, { status: 400 });
    }

    if (action === 'verify') {
      if (typeof storedHash !== 'string') {
        return NextResponse.json({ isValid: false, needsRehash: false });
      }
      const isValid = serverVerify(password, storedHash);
      return NextResponse.json({ isValid, needsRehash: false });
    }

    if (action === 'hash') {
      const hash = serverHash(password);
      return NextResponse.json({ hash });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
