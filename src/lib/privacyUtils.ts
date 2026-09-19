/**
 * PRIVACY & MASKING UTILITIES
 * Protects student privacy by masking personal contact information unless explicitly permitted.
 */

export const DEFAULT_TEMP_PASSWORD = 'Classmate@123';

/**
 * Masks a phone number (e.g., "+91 98765 43210" -> "+91 98765 •••••")
 */
export const maskPhone = (phone?: string): string => {
  if (!phone) return 'Not provided';
  const clean = phone.trim();
  if (clean.length <= 5) return '••••••';
  const visiblePrefix = clean.slice(0, Math.max(5, clean.length - 5));
  return `${visiblePrefix} •••••`;
};

/**
 * Masks an email address (e.g., "rahul.sharma@example.com" -> "r•••••a@example.com")
 */
export const maskEmail = (email?: string): string => {
  if (!email) return 'Not provided';
  const parts = email.trim().split('@');
  if (parts.length !== 2) return '••••••@••••';
  const [user, domain] = parts;
  if (user.length <= 2) return `${user[0]}••••@${domain}`;
  const maskedUser = `${user[0]}••••${user[user.length - 1]}`;
  return `${maskedUser}@${domain}`;
};
