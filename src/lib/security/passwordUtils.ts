/**
 * CRYPTOGRAPHIC PASSWORD HASHING UTILITY
 * Uses native Web Crypto API (PBKDF2 with SHA-256 and 100,000 iterations).
 * Compatible with Node.js server environments, modern secure browsers (HTTPS/localhost),
 * and gracefully falls back to server-side PBKDF2 in insecure mobile LAN HTTP contexts.
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

function getSubtleCrypto(): { subtle: SubtleCrypto | null; getRandomValues: (arr: Uint8Array) => Uint8Array } {
  if (typeof window !== 'undefined') {
    // Browser environment
    const browserCrypto = globalThis.crypto;
    const subtle = browserCrypto?.subtle || null;
    const getRandomValues = (arr: Uint8Array) => {
      if (browserCrypto?.getRandomValues) {
        return browserCrypto.getRandomValues(arr);
      }
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    };
    return { subtle, getRandomValues };
  }

  // Node.js server environment
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto');
    return {
      subtle: nodeCrypto.webcrypto.subtle,
      getRandomValues: (arr: Uint8Array) => nodeCrypto.webcrypto.getRandomValues(arr),
    };
  } catch {
    return {
      subtle: null,
      getRandomValues: (arr: Uint8Array) => arr,
    };
  }
}

/**
 * Hashes a plaintext password using PBKDF2-SHA256 with a unique random 16-byte salt.
 * Output format: pbkdf2:100000:<saltHex>:<hashHex>
 */
export async function hashPassword(password: string): Promise<string> {
  const { subtle, getRandomValues } = getSubtleCrypto();

  if (!subtle) {
    // Insecure browser context (e.g. mobile phone browsing LAN HTTP)
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/auth/password-crypto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'hash', password }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.hash) return data.hash;
        }
      } catch (err) {
        console.error('Remote password hashing failed:', err);
      }
    }
    throw new Error('Cryptographic hashing is not supported in this environment.');
  }

  const enc = new TextEncoder();
  const salt = new Uint8Array(16);
  getRandomValues(salt);

  const keyMaterial = await subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await subtle.deriveBits(
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

  const { subtle } = getSubtleCrypto();

  if (!subtle) {
    // Insecure browser context (e.g. mobile phone browsing LAN HTTP)
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/auth/password-crypto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify', password, storedHash }),
        });
        if (res.ok) {
          const data = await res.json();
          return { isValid: Boolean(data.isValid), needsRehash: false };
        }
      } catch (err) {
        console.error('Remote password verification failed:', err);
      }
    }
    return { isValid: false, needsRehash: false };
  }

  try {
    const parts = storedHash.split(':');
    if (parts.length !== 4) return { isValid: false, needsRehash: false };

    const iterations = parseInt(parts[1], 10);
    const salt = hexToBuffer(parts[2]);
    const expectedHashHex = parts[3];

    const enc = new TextEncoder();

    const keyMaterial = await subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await subtle.deriveBits(
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
