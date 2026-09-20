import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeChatMessage, validateEmojiReaction, sanitizeProfileText } from '@/lib/security/inputSanitizer';

describe('Input Validation: Chat Message & Profile Payload Sanitization', () => {
  test('strips null bytes and control characters from chat messages', () => {
    const maliciousInput = 'Hello\x00World\x08!\x1b[31mRed';
    const sanitized = sanitizeChatMessage(maliciousInput);
    assert.strictEqual(sanitized, 'HelloWorld![31mRed');
    assert.ok(!sanitized.includes('\x00'));
  });

  test('enforces maximum length cap on chat messages', () => {
    const hugeMessage = 'A'.repeat(10000);
    const sanitized = sanitizeChatMessage(hugeMessage);
    assert.strictEqual(sanitized.length, 4000, 'Message must be capped at 4000 characters');
  });

  test('validates emoji reactions against malicious payload injection', () => {
    assert.strictEqual(validateEmojiReaction('👍'), true);
    assert.strictEqual(validateEmojiReaction('🔥'), true);
    assert.strictEqual(validateEmojiReaction('❤️'), true);

    // Rejects scripts or oversized strings in reaction emoji
    assert.strictEqual(validateEmojiReaction('<script>'), false);
    assert.strictEqual(validateEmojiReaction('alert(1)'), false);
    assert.strictEqual(validateEmojiReaction('A'.repeat(50)), false);
    assert.strictEqual(validateEmojiReaction(''), false);
  });

  test('sanitizes profile text fields and caps length', () => {
    const rawBio = 'Software Engineer \x00\x1fwith passion! ' + 'X'.repeat(500);
    const cleanBio = sanitizeProfileText(rawBio, 100);
    assert.strictEqual(cleanBio.length, 100);
    assert.ok(!cleanBio.includes('\x00'));
  });
});
