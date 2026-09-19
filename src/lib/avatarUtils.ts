/**
 * Check if a URL or data string is a video file or video service link.
 * HTML <img> tags cannot render video files and will produce broken images.
 */
export const isVideoSource = (src?: string | null): boolean => {
  if (!src || typeof src !== 'string') return false;
  const clean = src.trim().toLowerCase().split('?')[0];
  const videoExtensions = ['.mp4', '.webm', '.mov', '.mkv', '.avi', '.m4v', '.ogv'];
  if (videoExtensions.some((ext) => clean.endsWith(ext))) return true;
  if (
    clean.includes('youtube.com') ||
    clean.includes('youtu.be') ||
    clean.includes('vimeo.com') ||
    clean.includes('tiktok.com') ||
    clean.startsWith('data:video/')
  ) {
    return true;
  }
  return false;
};

/**
 * Safe Avatar Resolver
 * Prevents empty strings and video URLs from breaking <img> tags.
 * Only supports lightweight images (JPG, PNG, WEBP, SVG) or animated GIFs.
 */
export const getSafeAvatar = (avatar?: string | null, name?: string): string => {
  if (avatar && typeof avatar === 'string' && avatar.trim().length > 0 && !isVideoSource(avatar)) {
    return avatar.trim();
  }
  const seed = name && typeof name === 'string' && name.trim().length > 0
    ? encodeURIComponent(name.trim())
    : 'classmate';
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
};

