import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '@/app/api/auth/login/route';
import { hashPassword } from '@/lib/security/passwordUtils';

describe('Authentication: Server-Side Login Flow & Credential Protection', () => {
  test('rejects login requests with missing identifier or password (HTTP 400)', async () => {
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '', password: '' }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  test('rejects login requests with incorrect password (HTTP 401)', async () => {
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'MCA-NONEXISTENT-999',
        password: 'WrongPassword!123',
        classroomId: 'cls_test',
      }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 401);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });
});
