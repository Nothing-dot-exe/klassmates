/**
 * INPUT SANITIZATION & PAYLOAD VALIDATION MODULE
 * Sanitizes chat content, names, bios, and reaction emojis against injection and DoS.
 */

/**
 * Sanitizes chat message text:
 * - Strips dangerous control characters & null bytes.
 * - Caps maximum message length at 4000 characters to prevent memory exhaustion DoS.
 */
export function sanitizeChatMessage(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '';
  // Strip null bytes and non-printable control characters (preserving \n and \t)
  const stripped = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return stripped.slice(0, 4000).trim();
}

/**
 * Validates emoji reactions to ensure only genuine emojis are accepted,
 * rejecting HTML tags, script snippets, or excessive payloads.
 */
export function validateEmojiReaction(emoji?: string | null): boolean {
  if (!emoji || typeof emoji !== 'string') return false;
  const trimmed = emoji.trim();
  if (trimmed.length < 1 || trimmed.length > 8) return false;
  // Disallow HTML tags, quotes, and ASCII alphanumeric characters in emoji reaction
  if (/[<>&"']|[a-zA-Z0-9]/.test(trimmed)) return false;
  return true;
}

/**
 * Sanitizes user profile text fields (name, nickname, bio).
 */
export function sanitizeProfileText(raw?: string | null, maxLen = 250): string {
  if (!raw || typeof raw !== 'string') return '';
  const stripped = raw.replace(/[\x00-\x1F\x7F]/g, '');
  return stripped.slice(0, maxLen).trim();
}

/**
 * Strict file validation for camera capture:
 * - Only photos / images allowed (jpeg, png, webp, heic, gif, etc.).
 * - Strictly rejects videos, audio, documents, and executables.
 */
export function validateCameraPhotoFile(file?: { name?: string; type?: string } | null): {
  isValidPhoto: boolean;
  errorMessage?: string;
} {
  if (!file) return { isValidPhoto: false, errorMessage: 'No file provided.' };

  const fileName = file.name || '';
  const fileType = file.type || '';

  const isVideo = fileType.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogg|avi|mkv)$/i.test(fileName);
  if (isVideo) {
    return {
      isValidPhoto: false,
      errorMessage: 'The camera button is strictly for photos. To send videos, please use the paperclip attachment icon.',
    };
  }

  const isImage = fileType.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|heic|heif)$/i.test(fileName);
  if (!isImage) {
    return {
      isValidPhoto: false,
      errorMessage: 'The camera button is strictly for photos. To send documents or other files, please use the paperclip attachment icon.',
    };
  }

  return { isValidPhoto: true };
}

