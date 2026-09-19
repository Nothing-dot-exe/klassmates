/**
 * SESSION SECURITY & ANTI-FORGERY MODULE
 * Generates and validates cryptographic session signatures to prevent client-side role forgery.
 */

const SESSION_SECRET_SEED = process.env.NEXT_PUBLIC_SESSION_SECRET || 'classmate_secure_app_session_token_key_2026';

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
export async function signUserSession(userId: string, role: string, classroomId?: string): Promise<string> {
  const cryptoObj = getCrypto();
  const enc = new TextEncoder();
  const issuedAt = Date.now();
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

  return btoa(JSON.stringify(envelope));
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
    const jsonStr = atob(token);
    const envelope: SessionSignature = JSON.parse(jsonStr);

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
