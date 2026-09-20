import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '@/app/api/send-approval-email/route';
import { signUserSession } from '@/lib/security/sessionSecurity';

describe('RBAC: API Route Protection & Privilege Boundaries', () => {
  const validPayload = {
    to: 'student@test.edu',
    name: 'Alice Student',
    rollNo: 'MCA-001',
    email: 'student@test.edu',
    classroomName: 'MCA Class',
    classroomCode: 'MCACLASS',
    adminName: 'CR Bob',
  };

  test('POST /api/send-approval-email rejects unauthenticated requests (HTTP 401)', async () => {
    const req = new Request('http://localhost:3000/api/send-approval-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 401, 'Unauthenticated request must return 401 Unauthorized');
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  test('POST /api/send-approval-email rejects requests from standard student role (HTTP 403)', async () => {
    const studentToken = await signUserSession('usr_student', 'student', 'cls_123');
    const req = new Request('http://localhost:3000/api/send-approval-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 403, 'Student token must return 403 Forbidden');
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  test('POST /api/send-approval-email accepts verified admin session', async () => {
    const adminToken = await signUserSession('usr_admin', 'admin', 'cls_123');
    const req = new Request('http://localhost:3000/api/send-approval-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    // 200 in devMode/simulated or delivery
    assert.strictEqual(res.status, 200, 'Admin token must be allowed (HTTP 200)');
    const json = await res.json();
    assert.strictEqual(json.success, true);
  });
});
