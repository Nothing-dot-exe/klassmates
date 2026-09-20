import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Classroom, User } from '@/types';
import { authenticateRequest } from '@/lib/server/serverAuth';
import { signUserSession } from '@/lib/security/sessionSecurity';

describe('RBAC: Admin Privilege Gates & Authorization Matrix', () => {
  const mockClassroom: Classroom = {
    id: 'cls_test_001',
    name: 'Computer Science',
    code: 'CS2026',
    section: 'A',
    semester: '6',
    institution: 'University',
    adminId: 'usr_cr_lead',
    adminName: 'Lead CR',
    adminEmail: 'cr@university.edu',
    membersCount: 25,
    autoDeleteSetting: 'off',
    requireApproval: true,
  };

  test('non-admin student cannot pass admin authorization gate', async () => {
    const studentToken = await signUserSession('usr_student_1', 'student', mockClassroom.id);
    const req = new Request('http://localhost:3000/api/admin-op', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    const check = await authenticateRequest(req, 'admin', mockClassroom.id);
    assert.strictEqual(check.authorized, false, 'Student session must be rejected for admin operations');
    assert.strictEqual(check.statusCode, 403);
  });

  test('admin session from different classroom cannot execute admin operations on target classroom', async () => {
    // Admin of classroom B
    const alienAdminToken = await signUserSession('usr_admin_foreign', 'admin', 'cls_different_room');
    const req = new Request('http://localhost:3000/api/admin-op', {
      headers: { Authorization: `Bearer ${alienAdminToken}` },
    });

    const check = await authenticateRequest(req, 'admin', mockClassroom.id);
    assert.strictEqual(check.authorized, false, 'Admin from different classroom must be rejected');
    assert.strictEqual(check.statusCode, 403);
  });

  test('verified room admin session successfully passes privilege gate', async () => {
    const validAdminToken = await signUserSession('usr_cr_lead', 'admin', mockClassroom.id);
    const req = new Request('http://localhost:3000/api/admin-op', {
      headers: { Authorization: `Bearer ${validAdminToken}` },
    });

    const check = await authenticateRequest(req, 'admin', mockClassroom.id);
    assert.strictEqual(check.authorized, true, 'Verified room admin must pass gate');
    assert.strictEqual(check.statusCode, 200);
  });
});
