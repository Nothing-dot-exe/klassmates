import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { User } from '@/types';
import { sanitizeBroadcastStudent } from '@/lib/realtimeService';

describe('WebSockets & Real-Time: PII Stripping from Broadcasts', () => {
  const mockStudentWithSensitiveData: User = {
    id: 'usr_sensitive_123',
    name: 'Secret Student',
    nickname: 'Secret',
    rollNo: 'S-999',
    email: 'secret@university.edu',
    phone: '+1-555-0199',
    password: 'pbkdf2:10000$saltsalt$hashhashhash',
    mustChangePassword: false,
    showPhone: false,
    showEmail: false,
    role: 'student',
    avatar: 'https://example.com/avatar.png',
    status: 'online',
    joinedAt: '2026-01-01',
    bio: 'Public student bio',
  };

  test('strips passwords and private contact info before broadcasting over WebSocket', () => {
    const broadcastPayload = sanitizeBroadcastStudent(mockStudentWithSensitiveData);

    // Passwords must never be transmitted over WebSocket broadcasts
    assert.strictEqual((broadcastPayload as any).password, undefined, 'password must be stripped from broadcast');
    assert.strictEqual((broadcastPayload as any).mustChangePassword, undefined, 'mustChangePassword must be stripped');

    // Private phone and email must be stripped when showPhone/showEmail are false
    assert.strictEqual((broadcastPayload as any).phone, undefined, 'phone must be stripped when showPhone=false');
    assert.strictEqual((broadcastPayload as any).email, undefined, 'email must be stripped when showEmail=false');

    // Safe public fields remain
    assert.strictEqual(broadcastPayload.id, 'usr_sensitive_123');
    assert.strictEqual(broadcastPayload.name, 'Secret Student');
    assert.strictEqual(broadcastPayload.nickname, 'Secret');
    assert.strictEqual(broadcastPayload.avatar, 'https://example.com/avatar.png');
    assert.strictEqual(broadcastPayload.bio, 'Public student bio');
    assert.strictEqual(broadcastPayload.status, 'online');
  });
});
