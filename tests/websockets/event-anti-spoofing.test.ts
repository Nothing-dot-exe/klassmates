import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { User } from '@/types';
import { applySafeStudentBroadcastUpdate } from '@/lib/realtimeService';

describe('WebSockets & Real-Time: Broadcast Event Anti-Spoofing & Privilege Protection', () => {
  const existingStudent: User = {
    id: 'usr_student_target',
    name: 'Normal Student',
    rollNo: 'S-100',
    email: 'normal@test.edu',
    role: 'student',
    avatar: 'https://example.com/avatar.png',
    status: 'online',
    joinedAt: '2026-01-01',
  };

  test('peer broadcast event cannot escalate existing student role to admin', () => {
    // Malicious broadcast attempting to elevate role
    const forgedUpdatePayload: Partial<User> = {
      id: 'usr_student_target',
      name: 'Normal Student With New Nick',
      role: 'admin', // FORGERY ATTEMPT
      avatar: 'https://example.com/new-avatar.png',
    };

    const updated = applySafeStudentBroadcastUpdate(existingStudent, forgedUpdatePayload);

    // Name and avatar update
    assert.strictEqual(updated.name, 'Normal Student With New Nick');
    assert.strictEqual(updated.avatar, 'https://example.com/new-avatar.png');

    // Role MUST remain unchanged
    assert.strictEqual(updated.role, 'student', 'Role must NEVER be altered via peer broadcast events');
  });

  test('peer broadcast cannot overwrite critical immutable identifiers (id, rollNo)', () => {
    const forgedUpdatePayload: Partial<User> = {
      id: 'usr_different_id',
      rollNo: 'FORGED_ROLL',
      name: 'Renamed Student',
    };

    const updated = applySafeStudentBroadcastUpdate(existingStudent, forgedUpdatePayload);

    assert.strictEqual(updated.id, 'usr_student_target', 'Student ID must remain immutable');
    assert.strictEqual(updated.rollNo, 'S-100', 'Student roll number must remain immutable');
    assert.strictEqual(updated.name, 'Renamed Student');
  });
});
