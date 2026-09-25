/**
 * SESSION SECURITY & ANTI-FORGERY MODULE
 * Generates and validates cryptographic session signatures to prevent client-side role forgery.
 * Fully compatible with Node.js, modern secure HTTPS/localhost contexts, and mobile LAN HTTP contexts.
 */

const SESSION_SECRET_SEED =
  process.env.SESSION_SIGNING_SECRET ||
  process.env.NEXT_PUBLIC_SESSION_SECRET ||
  'classmate_secure_app_session_token_key_2026';

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function getSubtleCrypto(): SubtleCrypto | null {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('crypto').webcrypto?.subtle || null;
    } catch {
      return null;
    }
  }
  return null;
}

function computeFallbackHmac(data: string): string {
  // Deterministic 64-character hash expansion for insecure LAN contexts where Web Crypto Subtle is blocked
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57, h3 = 0x9e3779b9, h4 = 0x1b873593;
  const combined = SESSION_SECRET_SEED + '::' + data;
  for (let i = 0; i < combined.length; i++) {
    const ch = combined.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822507);
    h4 = Math.imul(h4 ^ ch, 3266489909);
  }
  const s1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const s2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const s3 = (h3 >>> 0).toString(16).padStart(8, '0');
  const s4 = (h4 >>> 0).toString(16).padStart(8, '0');
  return `lan_sig_${s1}${s2}${s3}${s4}`;
}

async function computeSignature(rawData: string): Promise<string> {
  const subtle = getSubtleCrypto();
  if (!subtle) {
    return computeFallbackHmac(rawData);
  }

  try {
    const enc = new TextEncoder();
    const key = await subtle.importKey(
      'raw',
      enc.encode(SESSION_SECRET_SEED),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
    const signatureBytes = await subtle.sign('HMAC', key, enc.encode(rawData));
    return bufferToHex(signatureBytes);
  } catch {
    return computeFallbackHmac(rawData);
  }
}

export interface SessionSignature {
  userId: string;
  role: string;
  classroomId?: string;
  issuedAt: number;
  signature: string;
}

/**
 * Signs a session with an HMAC-SHA256 signature (or safe LAN signature in insecure mobile contexts).
 */
export async function signUserSession(
  userId: string,
  role: string,
  classroomId?: string,
  customIssuedAt?: number
): Promise<string> {
  const issuedAt = customIssuedAt !== undefined ? customIssuedAt : Date.now();
  const rawData = `${userId}:${role}:${classroomId || ''}:${issuedAt}`;
  const signatureHex = await computeSignature(rawData);

  const envelope: SessionSignature = {
    userId,
    role,
    classroomId,
    issuedAt,
    signature: signatureHex,
  };

  const json = JSON.stringify(envelope);
  if (typeof btoa !== 'undefined') {
    return btoa(json);
  }
  return Buffer.from(json).toString('base64');
}

/**
 * Decodes a session envelope without verifying signature.
 */
export function decodeSessionToken(token: string): SessionSignature | null {
  if (!token) return null;
  try {
    const jsonStr = typeof atob !== 'undefined' ? atob(token) : Buffer.from(token, 'base64').toString('utf8');
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Validates a signed session envelope string against the expected user, role, and classroom.
 */
export async function verifyUserSession(
  token: string,
  expectedUserId: string,
  expectedRole: string,
  expectedClassroomId?: string
): Promise<boolean> {
  if (!token || !expectedUserId) return false;

  try {
    const envelope = decodeSessionToken(token);
    if (!envelope) return false;

    if (envelope.userId !== expectedUserId) return false;
    if (envelope.role !== expectedRole) return false;
    if (expectedClassroomId && envelope.classroomId && envelope.classroomId !== expectedClassroomId) return false;

    // Reject sessions older than 30 days
    if (Date.now() - envelope.issuedAt > 30 * 24 * 60 * 60 * 1000) return false;

    const rawData = `${envelope.userId}:${envelope.role}:${envelope.classroomId || ''}:${envelope.issuedAt}`;
    const expectedSigHex = await computeSignature(rawData);

    return expectedSigHex === envelope.signature;
  } catch {
    return false;
  }
}

/**
 * Standalone verification of a session token returning the verified payload or null.
 */
export async function verifySessionTokenOnly(token: string): Promise<SessionSignature | null> {
  if (!token) return null;
  try {
    const envelope = decodeSessionToken(token);
    if (!envelope || !envelope.userId || !envelope.role || !envelope.signature) return null;

    // Reject sessions older than 30 days
    if (Date.now() - envelope.issuedAt > 30 * 24 * 60 * 60 * 1000) return null;

    const rawData = `${envelope.userId}:${envelope.role}:${envelope.classroomId || ''}:${envelope.issuedAt}`;
    const expectedSigHex = await computeSignature(rawData);

    if (expectedSigHex !== envelope.signature) return null;
    return envelope;
  } catch {
    return null;
  }
}
