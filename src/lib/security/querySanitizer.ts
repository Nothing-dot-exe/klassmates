/**
 * QUERY & FILTER SANITIZER MODULE
 * Neutralizes PostgREST filter injection vectors, special characters, and operator manipulation.
 */

/**
 * Sanitizes input before interpolating into PostgREST filters (such as .or() or .ilike()).
 * Strips commas, parentheses, colons, quotes, and wildcard characters that alter query AST.
 */
export function sanitizePostgrestFilter(input: string): string {
  if (!input || typeof input !== 'string') return '';
  // Strip control characters, commas, parens, colons, quotes, and PostgREST operator characters
  return input
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/[,():"'{}\\*?%]/g, '')
    .trim();
}

/**
 * Validates whether an input looks like a valid student roll number or USN.
 * Strictly alphanumeric and safe dashes/underscores (e.g. "CS-2024-001", "1MS21CS001").
 */
export function sanitizeRollNumber(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.trim().replace(/[^a-zA-Z0-9\-_]/g, '').toUpperCase();
}

/**
 * Normalizes and validates an email string.
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const clean = input.trim().toLowerCase().replace(/[\x00-\x1f\x7f\s,"'()<>\\]/g, '');
  return clean;
}
