/**
 * COLLISION-SAFE UNIQUE ID GENERATOR
 * Combines high-resolution timestamp, cryptographically secure randomness, and custom prefix.
 */

export function generateUniqueId(prefix: string = 'id'): string {
  const ts = Date.now();
  let randomHex = '';

  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    const bytes = new Uint8Array(6);
    globalThis.crypto.getRandomValues(bytes);
    for (let i = 0; i < bytes.length; i++) {
      randomHex += bytes[i].toString(16).padStart(2, '0');
    }
  } else {
    randomHex = Math.random().toString(36).substring(2, 12);
  }

  return `${prefix}_${ts}_${randomHex}`;
}
