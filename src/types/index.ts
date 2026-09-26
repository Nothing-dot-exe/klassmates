export type UserRole = 'admin' | 'student';

export type PresenceStatus = 'online' | 'studying' | 'idle' | 'offline';

export interface User {
  id: string;
  name: string;
  nickname?: string;
  rollNo: string;
  email: string;
  phone?: string;
  password?: string;
  mustChangePassword?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  role: UserRole;
  isTeacher?: boolean;
  designation?: string;
  avatar: string;
  status: PresenceStatus;
  joinedAt: string;
  bio?: string;
  classroomId?: string;
}

export interface PendingRequest {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  phone?: string;
  password?: string;
  showPhone?: boolean;
  showEmail?: boolean;
  isTeacher?: boolean;
  designation?: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PasswordResetRequest {
  id: string;
  classroomId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  phone?: string;
  email?: string;
  note?: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type AutoDeleteOption = 'off' | '24h' | '7d';

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs
}

export interface DocumentItem {
  id: string;
  title: string;
  fileName: string;
  fileType: 'markdown' | 'pdf' | 'code' | 'image' | 'archive';
  fileSize: string;
  uploadedBy: string;
  uploaderName: string;
  uploadedAt: string;
  subject: string;
  syllabusModule?: string;
  isHighExamValue?: boolean;
  discussionCount?: number;
  source: 'chat' | 'direct_upload';
  sourceChannel?: string;
  downloadUrl: string;
  content?: string; // For markdown files
  tags: string[];
}

export interface ChatReplyReference {
  id: string;
  senderName: string;
  senderRollNo?: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  hasDocument?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRollNo: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  channelId?: string;
  recipientId?: string; // for DMs
  isEncrypted: boolean;
  autoDelete: AutoDeleteOption;
  expiresAt?: string;
  imageUrl?: string;
  videoUrl?: string;
  document?: DocumentItem;
  reactions: MessageReaction[];
  replyTo?: ChatReplyReference;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  topic?: string;
  unreadCount?: number;
}

export interface Classroom {
  id: string;
  name: string;
  code: string;
  section: string;
  semester: string;
  institution: string;
  adminId: string;
  adminName?: string;
  adminPhone?: string;
  adminEmail?: string;
  adminPassword?: string;
  adminDesignation?: string;
  adminAvatar?: string;
  autoDeleteSetting: AutoDeleteOption;
  requireApproval: boolean;
  membersCount: number;
}

