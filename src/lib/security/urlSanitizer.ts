/**
 * URL SANITIZATION & PROTOCOL VALIDATION MODULE
 * Defends against XSS via javascript:, vbscript:, and malicious data:text/html URIs.
 */

const SAFE_PROTOCOLS = ['https:', 'http:', 'blob:'];
const SAFE_DATA_PREFIXES = [
  'data:image/png',
  'data:image/jpeg',
  'data:image/jpg',
  'data:image/webp',
  'data:image/gif',
  'data:application/pdf',
  'data:text/markdown',
  'data:text/plain',
];

/**
 * Validates whether a given URL or data URI uses a strictly safe scheme.
 */
export function isSafeUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();
  if (!trimmed || trimmed === '#') return false;

  // Decode common HTML entity obfuscations e.g. &#x09;, &#9;, &tab;, &#x0a;, &#10;
  const decoded = trimmed
    .replace(/&#x0*9;/gi, '')
    .replace(/&#0*9;/g, '')
    .replace(/&tab;/gi, '')
    .replace(/&#x0*a;/gi, '')
    .replace(/&#0*10;/g, '')
    .replace(/&#x0*d;/gi, '')
    .replace(/&#0*13;/g, '');

  // Normalize and remove control/whitespace characters used in protocol evasion
  const normalized = decoded.replace(/[\x00-\x20\x7F-\x9F]/g, '').toLowerCase();

  // Explicitly deny dangerous schemes
  if (
    normalized.startsWith('javascript:') ||
    normalized.startsWith('vbscript:') ||
    normalized.startsWith('file:') ||
    normalized.includes('javascript:')
  ) {
    return false;
  }

  // Handle data: URIs
  if (normalized.startsWith('data:')) {
    // Deny arbitrary HTML / SVG data URIs that can execute JavaScript
    if (normalized.startsWith('data:text/html') || normalized.startsWith('data:image/svg+xml')) {
      return false;
    }
    return SAFE_DATA_PREFIXES.some((prefix) => normalized.startsWith(prefix));
  }

  // Handle standard network & blob protocols
  try {
    const parsed = new URL(trimmed, 'http://localhost');
    return SAFE_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitizes an untrusted URL, returning a safe fallback '#' if the scheme is unsafe.
 */
export function sanitizeUrl(url?: string | null, fallback = '#'): string {
  if (!url || typeof url !== 'string') return fallback;
  return isSafeUrl(url) ? url : fallback;
}
