/**
 * CRYPTOGRAPHIC PASSWORD HASHING UTILITY
 * Uses native Web Crypto API (PBKDF2 with SHA-256 and 100,000 iterations).
 * Compatible with both Node.js server environments and modern browsers.
 */

const ITERATIONS = 100000;
const KEY_LENGTH = 32; // 256 bits
const HASH_PREFIX = 'pbkdf2';

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function getCrypto(): Crypto {
  if (typeof globalThis.crypto !== 'undefined') {
    return globalThis.crypto;
  }
  // Node.js fallback
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('crypto').webcrypto;
}

/**
 * Hashes a plaintext password using PBKDF2-SHA256 with a unique random 16-byte salt.
 * Output format: pbkdf2:100000:<saltHex>:<hashHex>
 */
export async function hashPassword(password: string): Promise<string> {
  const cryptoObj = getCrypto();
  const enc = new TextEncoder();
  const salt = new Uint8Array(16);
  cryptoObj.getRandomValues(salt);

  const keyMaterial = await cryptoObj.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await cryptoObj.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const saltHex = bufferToHex(salt.buffer);
  const hashHex = bufferToHex(derivedBits);

  return `${HASH_PREFIX}:${ITERATIONS}:${saltHex}:${hashHex}`;
}

/**
 * Verifies a plaintext password against a stored hash string.
 * Supports legacy plaintext migration: if storedHash does not start with pbkdf2,
 * directly compares strings and returns true if matched.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<{ isValid: boolean; needsRehash: boolean }> {
  if (!storedHash || !password) {
    return { isValid: false, needsRehash: false };
  }

  // Legacy plaintext fallback
  if (!storedHash.startsWith(`${HASH_PREFIX}:`)) {
    const isLegacyMatch = password === storedHash;
    return { isValid: isLegacyMatch, needsRehash: isLegacyMatch };
  }

  try {
    const parts = storedHash.split(':');
    if (parts.length !== 4) return { isValid: false, needsRehash: false };

    const iterations = parseInt(parts[1], 10);
    const salt = hexToBuffer(parts[2]);
    const expectedHashHex = parts[3];

    const cryptoObj = getCrypto();
    const enc = new TextEncoder();

    const keyMaterial = await cryptoObj.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await cryptoObj.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      expectedHashHex.length * 4
    );

    const computedHashHex = bufferToHex(derivedBits);
    const isValid = computedHashHex === expectedHashHex;

    return { isValid, needsRehash: false };
  } catch (err) {
    console.error('Error verifying password hash:', err);
    return { isValid: false, needsRehash: false };
  }
}
