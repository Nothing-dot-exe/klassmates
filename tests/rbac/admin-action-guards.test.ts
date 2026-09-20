import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { useAdminActions } from '../../src/hooks/useAdminActions';
import { Classroom, User, PendingRequest, PasswordResetRequest } from '../../src/types';

const mockClassroom: Classroom = {
  id: 'cls_test',
  name: 'Test Class',
  code: 'TEST-1234',
  section: 'A',
  semester: '6',
  institution: 'Test College',
  adminId: 'usr_admin_1',
  adminName: 'Admin User',
  adminEmail: 'admin@college.edu',
  adminPhone: '9876543210',
  adminPassword: 'hashed_admin_pass',
  adminDesignation: 'Class Representative',
  autoDeleteSetting: 'off',
  requireApproval: true,
  membersCount: 2,
};

const studentUser: User = {
  id: 'usr_student_1',
  name: 'Alice Student',
  rollNo: 'CS-001',
  phone: '1234567890',
  email: 'alice@college.edu',
  password: 'pass',
  mustChangePassword: false,
  showPhone: false,
  showEmail: false,
  role: 'student',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alice',
  status: 'online',
  joinedAt: '2026-01-01',
};

const adminUser: User = {
  id: 'usr_admin_1',
  name: 'Admin User',
  rollNo: 'CS-000',
  phone: '9876543210',
  email: 'admin@college.edu',
  password: 'admin_pass',
  mustChangePassword: false,
  showPhone: true,
  showEmail: true,
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
  status: 'online',
  joinedAt: '2026-01-01',
};

describe('RBAC: Admin Actions Hook Gating & Privilege Isolation', () => {
  it('correctly identifies authorized admin vs standard student', () => {
    let mockStudents = [adminUser, studentUser];
    const studentActions = useAdminActions({
      classroom: mockClassroom,
      setClassroom: () => {},
      students: mockStudents,
      setStudents: () => {},
      pendingRequests: [],
      setPendingRequests: () => {},
      setPasswordResetRequests: () => {},
      setDocuments: () => {},
      setMessages: () => {},
      currentUser: studentUser,
      setCurrentUser: () => {},
      onUserLoggedIn: () => {},
    });

    assert.equal(studentActions.isAuthorizedAdmin(), false, 'Student must not be identified as admin');

    const adminActions = useAdminActions({
      classroom: mockClassroom,
      setClassroom: () => {},
      students: mockStudents,
      setStudents: () => {},
      pendingRequests: [],
      setPendingRequests: () => {},
      setPasswordResetRequests: () => {},
      setDocuments: () => {},
      setMessages: () => {},
      currentUser: adminUser,
      setCurrentUser: () => {},
      onUserLoggedIn: () => {},
    });

    assert.equal(adminActions.isAuthorizedAdmin(), true, 'Admin user must be identified as admin');
  });

  it('strictly blocks unauthorized student from approving pending enrollment requests', () => {
    const testReq: PendingRequest = {
      id: 'req_1',
      name: 'Bob Pending',
      rollNo: 'CS-002',
      phone: '1122334455',
      email: 'bob@college.edu',
      password: 'temp',
      showPhone: false,
      showEmail: false,
      requestedAt: 'Just now',
      status: 'pending',
    };

    let pendingList = [testReq];
    let studentList = [adminUser, studentUser];

    const studentActions = useAdminActions({
      classroom: mockClassroom,
      setClassroom: () => {},
      students: studentList,
      setStudents: (update) => {
        if (typeof update === 'function') studentList = update(studentList);
      },
      pendingRequests: pendingList,
      setPendingRequests: (update) => {
        if (typeof update === 'function') pendingList = update(pendingList);
      },
      setPasswordResetRequests: () => {},
      setDocuments: () => {},
      setMessages: () => {},
      currentUser: studentUser,
      setCurrentUser: () => {},
      onUserLoggedIn: () => {},
    });

    // Attempt unauthorized approval
    studentActions.handleApproveRequest('req_1');

    // Verification: pending request must NOT have been approved or removed by student
    assert.equal(pendingList.length, 1, 'Pending request must not be removed by student');
    assert.equal(studentList.length, 2, 'No student should be added to roster by unauthorized caller');
  });

  it('strictly blocks unauthorized student from resetting room data', () => {
    let classroomState = { ...mockClassroom };

    const studentActions = useAdminActions({
      classroom: classroomState,
      setClassroom: (update) => {
        if (typeof update === 'function') classroomState = update(classroomState);
        else classroomState = update;
      },
      students: [adminUser, studentUser],
      setStudents: () => {},
      pendingRequests: [],
      setPendingRequests: () => {},
      setPasswordResetRequests: () => {},
      setDocuments: () => {},
      setMessages: () => {},
      currentUser: studentUser,
      setCurrentUser: () => {},
      onUserLoggedIn: () => {},
    });

    studentActions.handleResetRoomData();

    // Verify classroom was NOT reset
    assert.equal(classroomState.id, 'cls_test', 'Classroom ID must not be wiped by student');
    assert.equal(classroomState.name, 'Test Class', 'Classroom name must remain intact');
  });

  it('prevents mass assignment of role/password when student updates own profile', () => {
    let studentList = [studentUser];
    let currentUserState = { ...studentUser };

    const studentActions = useAdminActions({
      classroom: mockClassroom,
      setClassroom: () => {},
      students: studentList,
      setStudents: (update) => {
        if (typeof update === 'function') studentList = update(studentList);
      },
      pendingRequests: [],
      setPendingRequests: () => {},
      setPasswordResetRequests: () => {},
      setDocuments: () => {},
      setMessages: () => {},
      currentUser: currentUserState,
      setCurrentUser: (u) => {
        if (u) currentUserState = u;
      },
      onUserLoggedIn: () => {},
    });

    // Student attempts to elevate themselves to admin role
    studentActions.handleUpdateStudent('usr_student_1', {
      name: 'Alice Updated',
      role: 'admin',
    } as any);

    assert.equal(currentUserState.name, 'Alice Updated', 'Legitimate profile updates should succeed');
    assert.equal(currentUserState.role, 'student', 'Privileged role attribute must not be overwritten by student');
  });

  it('prevents student from forcing another student to leave the classroom', async () => {
    const studentActions = useAdminActions({
      classroom: mockClassroom,
      setClassroom: () => {},
      students: [adminUser, studentUser],
      setStudents: () => {},
      pendingRequests: [],
      setPendingRequests: () => {},
      setPasswordResetRequests: () => {},
      setDocuments: () => {},
      setMessages: () => {},
      currentUser: studentUser,
      setCurrentUser: () => {},
      onUserLoggedIn: () => {},
    });

    // Student attempts to force another user to leave
    const victimUser: User = { ...studentUser, id: 'usr_victim' };
    const success = await studentActions.handleLeaveClassroom(victimUser);

    assert.equal(success, false, 'Non-admin user cannot evict another user');
  });
});
