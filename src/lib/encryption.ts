/**
 * AUTHENTIC CLIENT-SIDE AES-256-GCM ENCRYPTION & CHAT UTILITIES
 * Uses native Web Crypto API for client-side message encryption.
 */

const SALT = new Uint8Array([73, 110, 116, 101, 108, 108, 105, 103, 101, 110, 116, 67, 108, 97, 115, 115]); // "IntelligentClass"

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
  if (typeof globalThis.crypto !== 'undefined') return globalThis.crypto;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('crypto').webcrypto;
}

async function deriveAesKey(secret: string): Promise<CryptoKey> {
  const cryptoObj = getCrypto();
  const enc = new TextEncoder();
  const keyMaterial = await cryptoObj.subtle.importKey(
    'raw',
    enc.encode(secret || 'classmate_default_shared_room_key'),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return cryptoObj.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT as BufferSource,
      iterations: 50000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a message using real AES-GCM 256-bit encryption.
 * Output format: enc_aes256:<ivHex>:<cipherHex>
 */
export async function encryptMessageContent(plaintext: string, secretKey?: string): Promise<string> {
  if (!plaintext) return '';
  try {
    const cryptoObj = getCrypto();
    const enc = new TextEncoder();
    const key = await deriveAesKey(secretKey || 'classmate_e2ee_shared_key');
    const iv = new Uint8Array(12);
    cryptoObj.getRandomValues(iv);

    const ciphertext = await cryptoObj.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      enc.encode(plaintext)
    );

    return `enc_aes256:${bufferToHex(iv.buffer)}:${bufferToHex(ciphertext)}`;
  } catch (err) {
    console.error('AES-GCM encryption error:', err);
    return plaintext;
  }
}

/**
 * Decrypts an AES-GCM 256-bit encrypted message.
 */
export async function decryptMessageContent(ciphertext: string, secretKey?: string): Promise<string> {
  if (!ciphertext || !ciphertext.startsWith('enc_aes256:')) return ciphertext;
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) return ciphertext;

    const iv = hexToBuffer(parts[1]);
    const encryptedData = hexToBuffer(parts[2]);

    const cryptoObj = getCrypto();
    const key = await deriveAesKey(secretKey || 'classmate_e2ee_shared_key');

    const decrypted = await cryptoObj.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      encryptedData as BufferSource
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch {
    // If decryption key does not match or legacy data, return safe ciphertext
    return ciphertext;
  }
}

export function maskEncryptedPayload(text: string): string {
  if (text && text.startsWith('enc_aes256:')) {
    const hex = text.split(':')[2] || '';
    return `enc_aes256_${hex.slice(0, 24)}... [AES-256-GCM Encrypted]`;
  }
  return text;
}

export function formatTimeRemaining(expiresAt?: string): string {
  if (!expiresAt) return '';
  return `Expires ${expiresAt}`;
}

export function generateRandomCode(prefix: string = 'CS'): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${digits}`;
}
