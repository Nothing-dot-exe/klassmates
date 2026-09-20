/**
 * SESSION SECURITY & ANTI-FORGERY MODULE
 * Generates and validates cryptographic session signatures to prevent client-side role forgery.
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

function getCrypto(): Crypto {
  if (typeof globalThis.crypto !== 'undefined') {
    return globalThis.crypto;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('crypto').webcrypto;
}

async function getHmacKey(): Promise<CryptoKey> {
  const cryptoObj = getCrypto();
  const enc = new TextEncoder();
  return cryptoObj.subtle.importKey(
    'raw',
    enc.encode(SESSION_SECRET_SEED),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export interface SessionSignature {
  userId: string;
  role: string;
  classroomId?: string;
  issuedAt: number;
  signature: string;
}

/**
 * Signs a session with an HMAC-SHA256 signature.
 */
export async function signUserSession(
  userId: string,
  role: string,
  classroomId?: string,
  customIssuedAt?: number
): Promise<string> {
  const cryptoObj = getCrypto();
  const enc = new TextEncoder();
  const issuedAt = customIssuedAt !== undefined ? customIssuedAt : Date.now();
  const rawData = `${userId}:${role}:${classroomId || ''}:${issuedAt}`;

  const key = await getHmacKey();
  const signatureBytes = await cryptoObj.subtle.sign('HMAC', key, enc.encode(rawData));
  const signatureHex = bufferToHex(signatureBytes);

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

    const cryptoObj = getCrypto();
    const enc = new TextEncoder();
    const rawData = `${envelope.userId}:${envelope.role}:${envelope.classroomId || ''}:${envelope.issuedAt}`;

    const key = await getHmacKey();
    const expectedSigBytes = await cryptoObj.subtle.sign('HMAC', key, enc.encode(rawData));
    const computedSigHex = bufferToHex(expectedSigBytes);

    return computedSigHex === envelope.signature;
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

    const cryptoObj = getCrypto();
    const enc = new TextEncoder();
    const rawData = `${envelope.userId}:${envelope.role}:${envelope.classroomId || ''}:${envelope.issuedAt}`;

    const key = await getHmacKey();
    const expectedSigBytes = await cryptoObj.subtle.sign('HMAC', key, enc.encode(rawData));
    const computedSigHex = bufferToHex(expectedSigBytes);

    if (computedSigHex !== envelope.signature) return null;
    return envelope;
  } catch {
    return null;
  }
}

