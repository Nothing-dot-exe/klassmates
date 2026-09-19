/**
 * Safe Avatar Resolver
 * Prevents empty string "" from being passed to <img src="..."> to prevent React/browser network re-fetch warnings.
 */
export const getSafeAvatar = (avatar?: string | null, name?: string): string => {
  if (avatar && typeof avatar === 'string' && avatar.trim().length > 0) {
    return avatar.trim();
  }
  const seed = name && typeof name === 'string' && name.trim().length > 0
    ? encodeURIComponent(name.trim())
    : 'classmate';
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
};
