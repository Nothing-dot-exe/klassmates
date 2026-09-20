import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { useChatActions } from '../../src/hooks/useChatActions';
import { Classroom, User, ChatMessage, DocumentItem } from '../../src/types';

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
  membersCount: 3,
};

const studentAlice: User = {
  id: 'usr_alice',
  name: 'Alice',
  rollNo: 'CS-001',
  phone: '1234567890',
  email: 'alice@college.edu',
  password: 'pass',
  mustChangePassword: false,
  showPhone: false,
  showEmail: false,
  role: 'student',
  avatar: '',
  status: 'online',
  joinedAt: '2026-01-01',
};

const studentBob: User = {
  id: 'usr_bob',
  name: 'Bob',
  rollNo: 'CS-002',
  phone: '0987654321',
  email: 'bob@college.edu',
  password: 'pass',
  mustChangePassword: false,
  showPhone: false,
  showEmail: false,
  role: 'student',
  avatar: '',
  status: 'online',
  joinedAt: '2026-01-01',
};

const adminUser: User = {
  id: 'usr_admin_1',
  name: 'Admin User',
  rollNo: 'CS-000',
  phone: '9876543210',
  email: 'admin@college.edu',
  password: 'pass',
  mustChangePassword: false,
  showPhone: true,
  showEmail: true,
  role: 'admin',
  avatar: '',
  status: 'online',
  joinedAt: '2026-01-01',
};

describe('IDOR & Chat Authorization: Message and Channel Isolation', () => {
  it('blocks standard student from clearing public channel chat', () => {
    let messagesState: Record<string, ChatMessage[]> = {
      chn_general: [
        {
          id: 'msg_1',
          senderId: 'usr_alice',
          senderName: 'Alice',
          senderRollNo: 'CS-001',
          senderAvatar: '',
          content: 'Hello everyone!',
          timestamp: '10:00 AM',
          channelId: 'chn_general',
          isEncrypted: false,
          autoDelete: 'off',
          reactions: [],
        },
      ],
    };

    const chatActions = useChatActions({
      classroomId: mockClassroom.id,
      classroom: mockClassroom,
      currentUser: studentAlice,
      currentConversationKey: 'chn_general',
      selectedChannelId: 'chn_general',
      selectedDmUserId: '',
      activeView: 'channel',
      messages: messagesState,
      documents: [],
      setMessages: (update) => {
        if (typeof update === 'function') messagesState = update(messagesState);
      },
      setDocuments: () => {},
    });

    // Student Alice attempts to clear channel chat
    chatActions.handleClearChat();

    // Verify channel messages are NOT cleared
    assert.equal(messagesState.chn_general.length, 1, 'Student cannot clear public channel messages');
  });

  it('permits authorized admin to clear public channel chat for moderation', () => {
    let messagesState: Record<string, ChatMessage[]> = {
      chn_general: [
        {
          id: 'msg_1',
          senderId: 'usr_alice',
          senderName: 'Alice',
          senderRollNo: 'CS-001',
          senderAvatar: '',
          content: 'Hello everyone!',
          timestamp: '10:00 AM',
          channelId: 'chn_general',
          isEncrypted: false,
          autoDelete: 'off',
          reactions: [],
        },
      ],
    };

    const adminActions = useChatActions({
      classroomId: mockClassroom.id,
      classroom: mockClassroom,
      currentUser: adminUser,
      currentConversationKey: 'chn_general',
      selectedChannelId: 'chn_general',
      selectedDmUserId: '',
      activeView: 'channel',
      messages: messagesState,
      documents: [],
      setMessages: (update) => {
        if (typeof update === 'function') messagesState = update(messagesState);
      },
      setDocuments: () => {},
    });

    // Admin clears channel chat
    adminActions.handleClearChat();

    // Verify channel messages are cleared
    assert.equal(messagesState.chn_general.length, 0, 'Admin must be able to clear channel chat');
  });

  it('blocks student from deleting a document uploaded by another student', () => {
    const docOwnedByBob: DocumentItem = {
      id: 'doc_bob_notes',
      title: 'Bob Notes',
      fileName: 'notes.pdf',
      fileType: 'pdf',
      fileSize: '1.2 MB',
      uploadedBy: 'usr_bob',
      uploaderName: 'Bob',
      uploadedAt: '2026-02-01',
      subject: 'Computer Science',
      source: 'direct_upload',
      downloadUrl: 'https://example.com/doc.pdf',
      tags: [],
    };

    let docList = [docOwnedByBob];

    const aliceActions = useChatActions({
      classroomId: mockClassroom.id,
      classroom: mockClassroom,
      currentUser: studentAlice,
      currentConversationKey: 'chn_general',
      selectedChannelId: 'chn_general',
      selectedDmUserId: '',
      activeView: 'channel',
      messages: {},
      documents: docList,
      setMessages: () => {},
      setDocuments: (update) => {
        if (typeof update === 'function') docList = update(docList);
      },
    });

    // Alice attempts to delete Bob's document
    aliceActions.handleDeleteDocument('doc_bob_notes');

    assert.equal(docList.length, 1, 'Alice must not be able to delete Bob document');
  });

  it('permits document uploader to delete their own document', () => {
    const docOwnedByAlice: DocumentItem = {
      id: 'doc_alice_notes',
      title: 'Alice Notes',
      fileName: 'notes.pdf',
      fileType: 'pdf',
      fileSize: '1.2 MB',
      uploadedBy: 'usr_alice',
      uploaderName: 'Alice',
      uploadedAt: '2026-02-01',
      subject: 'Computer Science',
      source: 'direct_upload',
      downloadUrl: 'https://example.com/doc.pdf',
      tags: [],
    };

    let docList = [docOwnedByAlice];

    const aliceActions = useChatActions({
      classroomId: mockClassroom.id,
      classroom: mockClassroom,
      currentUser: studentAlice,
      currentConversationKey: 'chn_general',
      selectedChannelId: 'chn_general',
      selectedDmUserId: '',
      activeView: 'channel',
      messages: {},
      documents: docList,
      setMessages: () => {},
      setDocuments: (update) => {
        if (typeof update === 'function') docList = update(docList);
      },
    });

    // Alice deletes her own document
    aliceActions.handleDeleteDocument('doc_alice_notes');

    assert.equal(docList.length, 0, 'Alice must be able to delete her own document');
  });
});
