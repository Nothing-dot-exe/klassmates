import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateUniquenessLocally, normalizeEmail, normalizePhoneDigits } from '../../src/lib/services/uniquenessService';
import { User, Classroom, PendingRequest } from '../../src/types';

describe('Strict Single-Use Identity Constraints: Email & Phone Uniqueness', () => {
  const mockAdmin: User = {
    id: 'usr_admin_1',
    name: 'Admin CR',
    rollNo: '2BK21CS001',
    email: 'admin.lead@college.edu',
    phone: '+91 98765 43210',
    role: 'admin',
    avatar: '',
    status: 'online',
    joinedAt: '2026-09-01',
  };

  const mockStudent1: User = {
    id: 'usr_st_1',
    name: 'Rahul Sharma',
    rollNo: '2BK21CS045',
    email: 'rahul.s@college.edu',
    phone: '9845112233',
    role: 'student',
    avatar: '',
    status: 'online',
    joinedAt: '2026-09-02',
  };

  const mockClassroom: Classroom = {
    id: 'cls_1',
    name: 'CSE 6th Sem',
    code: 'CS-4001',
    section: 'A',
    semester: '6',
    institution: 'BKIT',
    adminId: 'usr_admin_1',
    adminName: 'Admin CR',
    adminEmail: 'admin.lead@college.edu',
    adminPhone: '+91 98765 43210',
    adminPassword: 'hash',
    autoDeleteSetting: 'off',
    requireApproval: true,
    membersCount: 2,
  };

  const mockPending: PendingRequest = {
    id: 'req_1',
    name: 'Pooja Patil',
    rollNo: '2BK21CS088',
    email: 'pooja.p@college.edu',
    phone: '9123456789',
    requestedAt: 'Just now',
    status: 'pending',
  };

  test('normalizes email and phone strings correctly', () => {
    assert.equal(normalizeEmail('  Test.User@College.EDU  '), 'test.user@college.edu');
    assert.equal(normalizePhoneDigits('+91 (987) 654-3210'), '919876543210');
    assert.equal(normalizePhoneDigits(''), '');
  });

  test('strictly blocks registration with an email already used by an existing student', () => {
    const result = validateUniquenessLocally({
      email: 'RAHUL.S@college.edu', // Case insensitive check
      phone: '9999988888',
      rollNo: '2BK21CS099',
      existingStudents: [mockAdmin, mockStudent1],
      pendingRequests: [mockPending],
      classroom: mockClassroom,
    });

    assert.equal(result.available, false);
    assert.equal(result.field, 'email');
    assert.match(result.message || '', /already registered/i);
  });

  test('strictly blocks registration with a mobile number already used by an existing student', () => {
    const result = validateUniquenessLocally({
      email: 'new.unique@college.edu',
      phone: '+91-98451-12233', // Formatted differently but same digits
      rollNo: '2BK21CS099',
      existingStudents: [mockAdmin, mockStudent1],
      pendingRequests: [mockPending],
      classroom: mockClassroom,
    });

    assert.equal(result.available, false);
    assert.equal(result.field, 'phone');
    assert.match(result.message || '', /already registered/i);
  });

  test('strictly blocks registration with an email already used by the classroom admin', () => {
    const result = validateUniquenessLocally({
      email: 'admin.lead@college.edu',
      phone: '9999911111',
      rollNo: '2BK21CS099',
      existingStudents: [mockAdmin, mockStudent1],
      pendingRequests: [mockPending],
      classroom: mockClassroom,
    });

    assert.equal(result.available, false);
    assert.equal(result.field, 'email');
    assert.match(result.message || '', /Classroom Administrator/i);
  });

  test('strictly blocks registration with a phone number already used by the classroom admin', () => {
    const result = validateUniquenessLocally({
      email: 'fresh.email@college.edu',
      phone: '919876543210',
      rollNo: '2BK21CS099',
      existingStudents: [mockAdmin, mockStudent1],
      pendingRequests: [mockPending],
      classroom: mockClassroom,
    });

    assert.equal(result.available, false);
    assert.equal(result.field, 'phone');
    assert.match(result.message || '', /Classroom Administrator/i);
  });

  test('strictly blocks registration with an email or phone matching a pending request', () => {
    const emailPendingResult = validateUniquenessLocally({
      email: 'pooja.p@college.edu',
      phone: '9000000000',
      existingStudents: [mockAdmin, mockStudent1],
      pendingRequests: [mockPending],
      classroom: mockClassroom,
    });

    assert.equal(emailPendingResult.available, false);
    assert.equal(emailPendingResult.field, 'email');
    assert.match(emailPendingResult.message || '', /pending approval/i);

    const phonePendingResult = validateUniquenessLocally({
      email: 'fresh@college.edu',
      phone: '9123456789',
      existingStudents: [mockAdmin, mockStudent1],
      pendingRequests: [mockPending],
      classroom: mockClassroom,
    });

    assert.equal(phonePendingResult.available, false);
    assert.equal(phonePendingResult.field, 'phone');
    assert.match(phonePendingResult.message || '', /pending approval/i);
  });

  test('allows registration when email and phone are completely fresh and unique', () => {
    const result = validateUniquenessLocally({
      email: 'brand.new.student@college.edu',
      phone: '9888877777',
      rollNo: '2BK21CS099',
      existingStudents: [mockAdmin, mockStudent1],
      pendingRequests: [mockPending],
      classroom: mockClassroom,
    });

    assert.equal(result.available, true);
    assert.equal(result.field, undefined);
  });

  test('allows updating own record without self-collision using excludeUserId', () => {
    const result = validateUniquenessLocally({
      email: 'rahul.s@college.edu',
      phone: '9845112233',
      rollNo: '2BK21CS045',
      existingStudents: [mockAdmin, mockStudent1],
      pendingRequests: [mockPending],
      classroom: mockClassroom,
      excludeUserId: 'usr_st_1',
    });

    assert.equal(result.available, true);
  });
});
