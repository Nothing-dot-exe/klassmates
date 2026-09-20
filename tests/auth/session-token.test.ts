import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { signUserSession, verifyUserSession } from '@/lib/security/sessionSecurity';

describe('Authentication: Cryptographic Session Security & Anti-Tampering', () => {
  test('generates valid token that verifies successfully with matching parameters', async () => {
    const token = await signUserSession('usr_123', 'student', 'cls_456');
    assert.ok(typeof token === 'string' && token.length > 20);

    const isValid = await verifyUserSession(token, 'usr_123', 'student', 'cls_456');
    assert.strictEqual(isValid, true, 'Valid token must be accepted');
  });

  test('rejects token if role is forged / tampered with (Vertical Privilege Escalation)', async () => {
    // Student creates valid student token
    const token = await signUserSession('usr_123', 'student', 'cls_456');

    // Attempt to verify with role='admin' must fail
    const isValidAsAdmin = await verifyUserSession(token, 'usr_123', 'admin', 'cls_456');
    assert.strictEqual(isValidAsAdmin, false, 'Student token must never verify as admin');

    // Tamper with envelope payload JSON (changing role: "student" to "admin")
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    decoded.role = 'admin';
    const forgedToken = Buffer.from(JSON.stringify(decoded)).toString('base64');

    const isForgedValid = await verifyUserSession(forgedToken, 'usr_123', 'admin', 'cls_456');
    assert.strictEqual(isForgedValid, false, 'Tampered signature must be rejected');
  });

  test('rejects token if userId is forged (Horizontal Privilege Escalation)', async () => {
    const token = await signUserSession('usr_alice', 'student', 'cls_456');
    const isValidForBob = await verifyUserSession(token, 'usr_bob', 'student', 'cls_456');
    assert.strictEqual(isValidForBob, false, 'Alice token must not authenticate Bob');
  });

  test('rejects expired sessions (> 30 days)', async () => {
    const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
    const token = await signUserSession('usr_123', 'student', 'cls_456', thirtyOneDaysAgo);
    const isValid = await verifyUserSession(token, 'usr_123', 'student', 'cls_456');
    assert.strictEqual(isValid, false, 'Sessions older than 30 days must be rejected');
  });
});
