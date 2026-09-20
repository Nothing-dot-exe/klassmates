import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCanDeleteForEveryone } from '@/lib/chatPermissions';

describe('IDOR & Deletion Permissions: Strict Permission Matrix', () => {
  const studentAlice = { id: 'usr_alice', role: 'student' as const, rollNo: 'A-101', name: 'Alice' };
  const adminBob = { id: 'usr_admin_bob', role: 'admin' as const, rollNo: 'CR-001', name: 'Bob CR' };
  const studentCharlie = { id: 'usr_charlie', role: 'student' as const, rollNo: 'C-103', name: 'Charlie' };

  describe('1-on-1 Direct Messages (DMs)', () => {
    test('message author can delete their own message for everyone in DM', () => {
      const msgByAlice = { senderId: 'usr_alice', senderRollNo: 'A-101', senderName: 'Alice' };

      const canDelete = evaluateCanDeleteForEveryone({
        isChannel: false,
        currentUser: studentAlice,
        targetMessage: msgByAlice,
        adminUser: adminBob,
      });

      assert.strictEqual(canDelete, true, 'Author must have Delete for Everyone option on their own DM');
    });

    test('recipient admin CANNOT delete student message for everyone in private DM', () => {
      const msgByAlice = { senderId: 'usr_alice', senderRollNo: 'A-101', senderName: 'Alice' };

      // Admin viewing Alice's message in DM
      const canAdminDeleteEveryone = evaluateCanDeleteForEveryone({
        isChannel: false,
        currentUser: adminBob,
        targetMessage: msgByAlice,
        adminUser: adminBob,
      });

      assert.strictEqual(
        canAdminDeleteEveryone,
        false,
        'Admin must NEVER have Delete for Everyone on other users messages in private DMs'
      );
    });

    test('recipient student CANNOT delete admin message for everyone in private DM', () => {
      const msgByAdmin = { senderId: 'usr_admin_bob', senderRollNo: 'CR-001', senderName: 'Bob CR' };

      const canStudentDeleteAdminMsg = evaluateCanDeleteForEveryone({
        isChannel: false,
        currentUser: studentAlice,
        targetMessage: msgByAdmin,
        adminUser: adminBob,
      });

      assert.strictEqual(canStudentDeleteAdminMsg, false, 'Recipient student cannot delete admin message for everyone');
    });
  });

  describe('Public Group Channels (#general)', () => {
    test('author can delete their own message for everyone in group channel', () => {
      const msgByAlice = { senderId: 'usr_alice', senderRollNo: 'A-101', senderName: 'Alice' };

      const canDelete = evaluateCanDeleteForEveryone({
        isChannel: true,
        currentUser: studentAlice,
        targetMessage: msgByAlice,
        adminUser: adminBob,
      });

      assert.strictEqual(canDelete, true, 'Author can delete their message for everyone in channel');
    });

    test('admin CAN delete any user message for everyone in group channel (Academic Moderation)', () => {
      const msgByAlice = { senderId: 'usr_alice', senderRollNo: 'A-101', senderName: 'Alice' };

      const canAdminModerate = evaluateCanDeleteForEveryone({
        isChannel: true,
        currentUser: adminBob,
        targetMessage: msgByAlice,
        adminUser: adminBob,
      });

      assert.strictEqual(canAdminModerate, true, 'Class Rep / Admin must be able to moderate public channels');
    });

    test('other student CANNOT delete someone else message for everyone in group channel', () => {
      const msgByAlice = { senderId: 'usr_alice', senderRollNo: 'A-101', senderName: 'Alice' };

      const canCharlieDelete = evaluateCanDeleteForEveryone({
        isChannel: true,
        currentUser: studentCharlie,
        targetMessage: msgByAlice,
        adminUser: adminBob,
      });

      assert.strictEqual(canCharlieDelete, false, 'Third-party student cannot delete someone elses message for everyone');
    });
  });
});
