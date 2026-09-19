import { User, Classroom, Channel, DocumentItem, ChatMessage, PendingRequest, PasswordResetRequest } from '@/types';

// Clean initial state — zero hardcoded demo users or mock identities
export const CURRENT_USER: User = {
  id: '',
  name: '',
  rollNo: '',
  email: '',
  phone: '',
  password: '',
  showPhone: true,
  showEmail: true,
  role: 'student',
  isTeacher: false,
  designation: '',
  avatar: '',
  status: 'online',
  joinedAt: '',
  bio: '',
};

export const INITIAL_STUDENTS: User[] = [];

export const EMPTY_CLASSROOM: Classroom = {
  id: '',
  name: '',
  code: '',
  section: '',
  semester: '',
  institution: '',
  adminId: '',
  adminName: '',
  adminPhone: '',
  adminEmail: '',
  adminPassword: '',
  autoDeleteSetting: 'off',
  requireApproval: true,
  membersCount: 0,
};

export const INITIAL_CLASSROOM: Classroom = EMPTY_CLASSROOM;

export const INITIAL_PENDING_REQUESTS: PendingRequest[] = [];

export const INITIAL_PASSWORD_RESET_REQUESTS: PasswordResetRequest[] = [];

// Standard classroom channels
export const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'chn_general',
    name: 'general',
    description: 'Class announcements, general discussion, and reminders',
    isPrivate: false,
    topic: 'Official classroom updates and discussion',
  },
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  chn_general: [],
};
