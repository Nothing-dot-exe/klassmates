import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeStudentProfileUpdate } from '@/lib/database/studentsDb';

describe('RBAC: Mass Assignment & Over-Posting Protection', () => {
  test('strips privileged fields (role, rollNo, id) from student profile update payload', () => {
    const maliciousPayload = {
      bio: 'New safe bio',
      avatar: 'https://example.com/avatar.png',
      nickname: 'CoolKid',
      // Privileged / protected attributes
      role: 'admin' as const,
      rollNo: 'FORGED_ROLL_999',
      id: 'FORGED_USER_ID',
      joinedAt: '2020-01-01',
    };

    const sanitized = sanitizeStudentProfileUpdate(maliciousPayload);

    assert.strictEqual(sanitized.bio, 'New safe bio');
    assert.strictEqual(sanitized.avatar, 'https://example.com/avatar.png');
    assert.strictEqual(sanitized.nickname, 'CoolKid');

    // Privileged fields must be completely stripped
    assert.strictEqual((sanitized as any).role, undefined, 'role must never be modifiable via profile update');
    assert.strictEqual((sanitized as any).rollNo, undefined, 'rollNo must never be modifiable via profile update');
    assert.strictEqual((sanitized as any).id, undefined, 'id must never be modifiable via profile update');
    assert.strictEqual((sanitized as any).joinedAt, undefined, 'joinedAt must never be modifiable via profile update');
  });

  test('allows safe user preference fields in student profile update', () => {
    const safePayload = {
      bio: 'Studying for exams',
      nickname: 'Dave',
      showPhone: false,
      showEmail: false,
      status: 'studying' as const,
    };

    const sanitized = sanitizeStudentProfileUpdate(safePayload);
    assert.strictEqual(sanitized.bio, 'Studying for exams');
    assert.strictEqual(sanitized.nickname, 'Dave');
    assert.strictEqual(sanitized.showPhone, false);
    assert.strictEqual(sanitized.showEmail, false);
    assert.strictEqual(sanitized.status, 'studying');
  });
});
