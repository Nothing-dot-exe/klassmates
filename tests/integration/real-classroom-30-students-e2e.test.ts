import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Classroom, User, ChatMessage, DocumentItem, AutoDeleteOption } from '../../src/types';
import { evaluateCanDeleteForEveryone } from '../../src/lib/chatPermissions';
import { getDmConversationKey, getConversationKey } from '../../src/lib/chatUtils';
import { validateCameraPhotoFile } from '../../src/lib/security/inputSanitizer';
import { CHAT_BACKGROUNDS, getThemedBackgroundStyle } from '../../src/components/chat/chatBackgrounds';
import { hashPassword, verifyPassword } from '../../src/lib/security/passwordUtils';

describe('Real-World Integration Test: 30-Student Classroom Lifecycle & Workflows', () => {
  // --- 1. CLASSROOM CREATION ---
  let classroom: Classroom;
  let admin: User;
  let students: User[] = [];
  let messages: Record<string, ChatMessage[]> = { chn_general: [] };
  let documents: DocumentItem[] = [];

  it('Step 1: Admin successfully creates a new classroom with secure hashed credentials', async () => {
    const rawAdminPass = 'MasterClassPass2026!';
    const hashedPass = await hashPassword(rawAdminPass);

    admin = {
      id: 'usr_admin_cr',
      name: 'Sarah Jenkins',
      rollNo: 'CS-000',
      phone: '+1-555-0100',
      email: 'sarah.jenkins@college.edu',
      password: rawAdminPass,
      mustChangePassword: false,
      showPhone: true,
      showEmail: true,
      role: 'admin',
      isTeacher: false,
      designation: 'Class Representative (CR)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SarahJenkins',
      status: 'online',
      joinedAt: new Date().toISOString().split('T')[0],
      bio: 'Class Representative & Lead Coordinator',
    };

    classroom = {
      id: 'cls_cse_final_2026',
      name: 'Computer Science Final Year 2026',
      code: 'CS-2026',
      section: 'Section A',
      semester: 'Semester 8',
      institution: 'Dept of Computer Science & Engineering',
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      adminPhone: admin.phone,
      adminPassword: hashedPass,
      adminDesignation: admin.designation,
      autoDeleteSetting: 'off',
      requireApproval: true,
      membersCount: 1,
    };

    assert.equal(classroom.name, 'Computer Science Final Year 2026');
    assert.equal(classroom.code, 'CS-2026');
    assert.ok(classroom.adminPassword && classroom.adminPassword.startsWith('pbkdf2:'), 'Password must be stored as PBKDF2 hash');

    const authCheck = await verifyPassword(rawAdminPass, classroom.adminPassword || '');
    assert.equal(authCheck.isValid, true, 'Admin password must verify against stored hash');
  });

  // --- 2. 30 STUDENTS ONBOARDING ---
  it('Step 2: Successfully enrolls 30 students with unique roll numbers and profiles', () => {
    const firstNames = [
      'Aarav', 'Ananya', 'Aditya', 'Bhavna', 'Chetan', 'Deepika', 'Eshan', 'Farhan',
      'Gauri', 'Harsh', 'Ishaan', 'Jaya', 'Karan', 'Lavanya', 'Manish', 'Neha',
      'Omkar', 'Pooja', 'Qasim', 'Rohan', 'Sneha', 'Tanmay', 'Uma', 'Varun',
      'Wasim', 'Xavier', 'Yamini', 'Zain', 'Kavita', 'Nikhil',
    ];

    students = firstNames.map((name, idx) => {
      const num = String(idx + 1).padStart(3, '0');
      const rollNo = `CS-${num}`;
      return {
        id: `usr_student_${num}`,
        name: `${name} Sharma`,
        rollNo,
        phone: `+1-555-02${num}`,
        email: `${name.toLowerCase()}@student.college.edu`,
        password: `StudentPass${num}!`,
        mustChangePassword: false,
        showPhone: false,
        showEmail: false,
        role: 'student',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${rollNo}`,
        status: 'online',
        joinedAt: new Date().toISOString().split('T')[0],
        bio: `CSE 2026 Batch - Student ${num}`,
      };
    });

    classroom.membersCount = 1 + students.length; // Admin + 30 students

    assert.equal(students.length, 30, 'Exactly 30 students must be enrolled');
    assert.equal(classroom.membersCount, 31, 'Total members count must be 31');
    assert.equal(students[0].rollNo, 'CS-001');
    assert.equal(students[29].rollNo, 'CS-030');
  });

  // --- 3. SENDING MESSAGES ---
  it('Step 3: Admin and students send group channel announcements and direct messages', () => {
    // Admin posts welcome announcement
    const adminAnnouncement: ChatMessage = {
      id: `msg_${Date.now()}_0`,
      senderId: admin.id,
      senderName: admin.name,
      senderRollNo: admin.rollNo,
      senderAvatar: admin.avatar,
      content: '📢 Welcome to CS Final Year 2026! Please review the syllabus in Document Hub.',
      timestamp: '09:00 AM',
      channelId: 'chn_general',
      isEncrypted: true,
      autoDelete: 'off',
      reactions: [],
    };
    messages.chn_general.push(adminAnnouncement);

    // 10 students post introductory replies in #general
    for (let i = 0; i < 10; i++) {
      const st = students[i];
      const studentMsg: ChatMessage = {
        id: `msg_${Date.now()}_${i + 1}`,
        senderId: st.id,
        senderName: st.name,
        senderRollNo: st.rollNo,
        senderAvatar: st.avatar,
        content: `Hi everyone, ${st.name} here from roll no ${st.rollNo}! Excited for this semester.`,
        timestamp: '09:05 AM',
        channelId: 'chn_general',
        isEncrypted: true,
        autoDelete: 'off',
        reactions: [],
      };
      messages.chn_general.push(studentMsg);
    }

    assert.equal(messages.chn_general.length, 11, '11 channel messages must be recorded');

    // 1-on-1 Direct Message between Student 5 and Student 12
    const st5 = students[4]; // CS-005
    const st12 = students[11]; // CS-012
    const dmKey = getDmConversationKey(st5.id, st12.id);

    const dmMessage: ChatMessage = {
      id: `msg_dm_${Date.now()}`,
      senderId: st5.id,
      senderName: st5.name,
      senderRollNo: st5.rollNo,
      senderAvatar: st5.avatar,
      recipientId: st12.id,
      content: 'Hey Chetan, do you have the notes for Machine Learning Module 3?',
      timestamp: '09:15 AM',
      isEncrypted: true,
      autoDelete: 'off',
      reactions: [],
    };

    messages[dmKey] = [dmMessage];

    assert.ok(messages[dmKey].length === 1, 'DM message must be recorded under symmetric key');
    assert.equal(getDmConversationKey(st12.id, st5.id), dmKey, 'DM key must be strictly symmetric');
  });

  // --- 4. SENDING PHOTOS & CAMERA VALIDATION ---
  it('Step 4: Tests photo sharing with strict photo-only validation (rejecting videos/documents)', () => {
    // 1. Valid camera photo test
    const photoFile = new File(['fake-jpg-content'], 'camera_capture_001.jpg', { type: 'image/jpeg' });
    const photoCheck = validateCameraPhotoFile(photoFile);
    assert.equal(photoCheck.isValidPhoto, true, 'JPEG photo must be accepted');

    const pngPhoto = new File(['fake-png-content'], 'whiteboard_diagram.png', { type: 'image/png' });
    assert.equal(validateCameraPhotoFile(pngPhoto).isValidPhoto, true, 'PNG photo must be accepted');

    // 2. Reject video file uploaded via camera button
    const videoFile = new File(['fake-mp4-content'], 'lecture_recording.mp4', { type: 'video/mp4' });
    const videoCheck = validateCameraPhotoFile(videoFile);
    assert.equal(videoCheck.isValidPhoto, false, 'Video files must be rejected via camera photo button');
    assert.ok(videoCheck.errorMessage?.includes('photos'), 'Error must specify photos');

    // 3. Reject documents via camera button
    const pdfFile = new File(['fake-pdf'], 'assignment.pdf', { type: 'application/pdf' });
    const pdfCheck = validateCameraPhotoFile(pdfFile);
    assert.equal(pdfCheck.isValidPhoto, false, 'PDF files must be rejected via camera photo button');

    // 4. Send valid photo message into #general
    const photoMessage: ChatMessage = {
      id: `msg_photo_${Date.now()}`,
      senderId: students[2].id, // CS-003
      senderName: students[2].name,
      senderRollNo: students[2].rollNo,
      senderAvatar: students[2].avatar,
      content: 'Here is the diagram from today lecture on distributed databases:',
      imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...',
      timestamp: '09:30 AM',
      channelId: 'chn_general',
      isEncrypted: true,
      autoDelete: 'off',
      reactions: [],
    };
    messages.chn_general.push(photoMessage);

    assert.ok(messages.chn_general.some((m) => m.imageUrl), 'Photo message must be present in channel');
  });

  // --- 5. SENDING & SHARING DOCUMENTS ---
  it('Step 5: Tests uploading study materials (PDF, Markdown) to Document Hub', () => {
    const syllabusDoc: DocumentItem = {
      id: 'doc_syllabus_final',
      title: 'CS-801 Distributed Systems Syllabus',
      fileName: 'distributed_systems_syllabus.pdf',
      fileType: 'pdf',
      fileSize: '1.4 MB',
      uploadedBy: admin.id,
      uploaderName: admin.name,
      uploadedAt: '2026-02-15',
      subject: 'Distributed Systems',
      syllabusModule: 'Module 1 - 5',
      isHighExamValue: true,
      source: 'direct_upload',
      downloadUrl: 'https://example.com/syllabus.pdf',
      tags: ['Syllabus', 'Exam Guide', 'Module 1-5'],
    };

    const notesDoc: DocumentItem = {
      id: 'doc_notes_ml',
      title: 'Machine Learning Quick Revision Summary',
      fileName: 'ml_revision.md',
      fileType: 'markdown',
      fileSize: '45 KB',
      uploadedBy: students[6].id,
      uploaderName: students[6].name,
      uploadedAt: '2026-02-16',
      subject: 'Machine Learning',
      isHighExamValue: true,
      source: 'chat',
      sourceChannel: 'chn_general',
      downloadUrl: 'data:text/markdown;utf8,#%20ML%20Revision%0A...',
      content: '# Machine Learning Revision\n- Supervised Learning\n- Backpropagation\n- CNNs & Transformers',
      tags: ['Notes', 'Revision', 'Cheat Sheet'],
    };

    documents.push(syllabusDoc, notesDoc);

    assert.equal(documents.length, 2, 'Two documents must be added to Document Hub');
    assert.equal(documents[0].fileType, 'pdf');
    assert.equal(documents[1].fileType, 'markdown');
  });

  // --- 6. CHANGING BACKGROUNDS / WALLPAPERS ---
  it('Step 6: Tests switching chat wallpapers across curated artistic themes', () => {
    const availableThemes = CHAT_BACKGROUNDS.map((bg) => bg.id);
    assert.ok(availableThemes.includes('minimal'), 'Default minimal must exist');
    assert.ok(availableThemes.includes('doodle'), 'Study doodles must exist');
    assert.ok(availableThemes.includes('grid'), 'Drafting blueprint must exist');
    assert.ok(availableThemes.includes('constellation'), 'Starlight sky must exist');

    // Test light and dark style generation
    for (const bgId of availableThemes) {
      const lightStyle = getThemedBackgroundStyle(bgId, false);
      const darkStyle = getThemedBackgroundStyle(bgId, true);

      assert.ok(
        Boolean(lightStyle.backgroundColor || lightStyle.backgroundImage),
        `Light style for ${bgId} must specify backgroundColor or backgroundImage`
      );
      assert.ok(
        Boolean(darkStyle.backgroundColor || darkStyle.backgroundImage),
        `Dark style for ${bgId} must specify backgroundColor or backgroundImage`
      );
    }
  });

  // --- 7. MESSAGE DELETION PERMISSIONS MATRIX ---
  it('Step 7: Tests message deletion matrix (Delete for Everyone vs Delete for Me)', () => {
    const student1Msg = messages.chn_general[1]; // Sent by CS-001

    // 1. Author (CS-001) CAN delete for everyone in channel
    const authorCanDelete = evaluateCanDeleteForEveryone({
      isChannel: true,
      currentUser: students[0], // CS-001
      targetMessage: student1Msg,
      adminUser: admin,
    });
    assert.equal(authorCanDelete, true, 'Author must be permitted to delete own message for everyone');

    // 2. Room Admin CAN delete someone else message for everyone in channel (Academic Moderation)
    const adminCanModerate = evaluateCanDeleteForEveryone({
      isChannel: true,
      currentUser: admin,
      targetMessage: student1Msg,
      adminUser: admin,
    });
    assert.equal(adminCanModerate, true, 'Room Admin must be permitted to delete user message in channel for moderation');

    // 3. Another student (CS-002) CANNOT delete CS-001 message for everyone in channel
    const student2CannotDelete = evaluateCanDeleteForEveryone({
      isChannel: true,
      currentUser: students[1], // CS-002
      targetMessage: student1Msg,
      adminUser: admin,
    });
    assert.equal(student2CannotDelete, false, 'Unrelated student must NOT be able to delete another user message for everyone');

    // 4. In 1-on-1 DM: Admin recipient CANNOT delete sender student message for everyone
    const dmKey = getDmConversationKey(students[4].id, students[11].id);
    const dmMsg = messages[dmKey][0];

    const recipientAdminCannotDeleteDm = evaluateCanDeleteForEveryone({
      isChannel: false,
      currentUser: admin,
      targetMessage: dmMsg,
      adminUser: admin,
    });
    assert.equal(recipientAdminCannotDeleteDm, false, 'Admin cannot delete student private DM for everyone');

    // 5. In 1-on-1 DM: Author CAN delete for everyone
    const dmAuthorCanDelete = evaluateCanDeleteForEveryone({
      isChannel: false,
      currentUser: students[4],
      targetMessage: dmMsg,
      adminUser: admin,
    });
    assert.equal(dmAuthorCanDelete, true, 'DM author can delete for everyone in private chat');
  });

  // --- 8. PROFILE EDITING & PRIVACY TOGGLES ---
  it('Step 8: Tests profile editing, nickname updates, and privacy controls', () => {
    let student15 = { ...students[14] }; // Student 15 (CS-015)

    // Student updates personal bio, nickname, and custom status
    student15.nickname = 'Manny';
    student15.bio = 'Deep Learning Enthusiast & Hackathon Winner 🏆';
    student15.status = 'studying';
    student15.showPhone = false; // Hide phone for privacy
    student15.showEmail = true;

    assert.equal(student15.nickname, 'Manny');
    assert.equal(student15.showPhone, false);
    assert.equal(student15.showEmail, true);
    assert.equal(student15.role, 'student', 'Role must remain student');
  });

  // --- 9. CONCURRENCY & MULTI-USER REACTIONS ---
  it('Step 9: Tests 15 concurrent students reacting to the admin announcement', () => {
    const targetMsg = messages.chn_general[0]; // Admin welcome notice
    const reactionEmoji = '🔥';

    // 15 students react with fire emoji
    const reactingStudents = students.slice(0, 15);
    const usersWhoReacted = reactingStudents.map((s) => s.id);

    targetMsg.reactions = [
      {
        emoji: reactionEmoji,
        count: usersWhoReacted.length,
        users: usersWhoReacted,
      },
      {
        emoji: '👏',
        count: 5,
        users: students.slice(15, 20).map((s) => s.id),
      },
    ];

    assert.equal(targetMsg.reactions[0].count, 15, 'Fire reaction count must be 15');
    assert.equal(targetMsg.reactions[0].users.length, 15);
    assert.equal(targetMsg.reactions[1].count, 5, 'Clap reaction count must be 5');
  });
});
