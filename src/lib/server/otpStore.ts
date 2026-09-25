import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

interface StoredOtp {
  hashedCode: string;
  expiresAt: number;
  attempts: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __classmateOtpStore: Map<string, StoredOtp> | undefined;
}

const getStore = (): Map<string, StoredOtp> => {
  if (!globalThis.__classmateOtpStore) {
    globalThis.__classmateOtpStore = new Map();
  }
  return globalThis.__classmateOtpStore;
};

const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use service role key if available for server-only operations, falling back to anon key
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

const getSecret = (): string => {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'classmate_security_salt_2026'
  );
};

/**
 * Creates a stateless, cryptographically signed verification token containing
 * the target email, expiration timestamp, and HMAC-SHA256 signature.
 * Guarantees 100% reliable verification across serverless lambdas, workers, and deployments.
 */
export function createSignedOtpToken(email: string, code: string, ttlMs: number = 10 * 60 * 1000): string {
  const cleanEmail = email.trim().toLowerCase();
  const expiresAt = Date.now() + ttlMs;
  const secret = getSecret();
  const data = `${cleanEmail}:${code.trim()}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
  const payload = JSON.stringify({ email: cleanEmail, expiresAt, signature });
  return Buffer.from(payload).toString('base64url');
}

/**
 * Verifies a signed OTP token against the supplied email and 6-digit code.
 */
export function verifySignedOtpToken(email: string, code: string, signedToken?: string): boolean {
  if (!signedToken || typeof signedToken !== 'string') return false;
  try {
    const raw = Buffer.from(signedToken, 'base64url').toString('utf8');
    const { email: tokenEmail, expiresAt, signature } = JSON.parse(raw);
    const cleanEmail = email.trim().toLowerCase();
    if (tokenEmail !== cleanEmail) return false;
    if (Date.now() > expiresAt) return false;

    const secret = getSecret();
    const expectedData = `${cleanEmail}:${code.trim()}:${expiresAt}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(expectedData).digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

/**
 * Creates a deterministic SHA-256 hash of an email and OTP code.
 * Ensures raw plaintext codes are never stored in memory or database.
 */
function hashOtp(email: string, code: string): string {
  return crypto.createHash('sha256').update(`${email.trim().toLowerCase()}:${code.trim()}`).digest('hex');
}

/**
 * Stores a cryptographically hashed OTP for an email with a 10-minute TTL.
 */
export const storeServerOtp = async (
  email: string,
  code: string,
  ttlMs: number = 10 * 60 * 1000
): Promise<void> => {
  const cleanEmail = email.trim().toLowerCase();
  const expiresAt = Date.now() + ttlMs;
  const hashedCode = hashOtp(cleanEmail, code);

  // 1. In-memory store
  const store = getStore();
  store.set(cleanEmail, {
    hashedCode,
    expiresAt,
    attempts: 0,
  });

  // 2. Dual-sync hashed OTP to Supabase table (never plaintext)
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      await supabase.from('email_otps').upsert({
        email: cleanEmail,
        code: hashedCode,
        expires_at: new Date(expiresAt).toISOString(),
        attempts: 0,
      });
    } catch {
      // ignore if table doesn't exist yet
    }
  }
};

/**
 * Validates a 6-digit code against the stored hash.
 * Increments failed attempts and invalidates/deletes after 5 attempts to prevent brute force.
 */
export const verifyServerOtp = async (email: string, token: string): Promise<boolean> => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();
  const inputHash = hashOtp(cleanEmail, cleanToken);
  const store = getStore();

  // 1. Check in-memory store
  const record = store.get(cleanEmail);
  if (record) {
    if (Date.now() > record.expiresAt || record.attempts >= 5) {
      store.delete(cleanEmail);
      return false;
    }

    if (record.hashedCode === inputHash) {
      store.delete(cleanEmail);
      const supabase = getSupabaseAdmin();
      if (supabase) {
        supabase.from('email_otps').delete().eq('email', cleanEmail).then(() => {});
      }
      return true;
    } else {
      record.attempts += 1;
      if (record.attempts >= 5) {
        store.delete(cleanEmail);
      }
    }
  }

  // 2. Check Supabase database
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('email_otps')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (data) {
        const isExpired = new Date(data.expires_at).getTime() <= Date.now();
        const currentAttempts = data.attempts || 0;

        if (isExpired || currentAttempts >= 5) {
          await supabase.from('email_otps').delete().eq('email', cleanEmail);
          return false;
        }

        if (data.code === inputHash) {
          await supabase.from('email_otps').delete().eq('email', cleanEmail);
          store.delete(cleanEmail);
          return true;
        } else {
          await supabase
            .from('email_otps')
            .update({ attempts: currentAttempts + 1 })
            .eq('email', cleanEmail);
        }
      }
    } catch {
      // ignore
    }
  }

  return false;
};
