import { Classroom, User, PendingRequest, PasswordResetRequest, ChatMessage, DocumentItem } from '@/types';

export interface AdminPanelProps {
  classroom: Classroom;
  students: User[];
  pendingRequests: PendingRequest[];
  passwordResetRequests?: PasswordResetRequest[];
  messages?: Record<string, ChatMessage[]>;
  documents?: DocumentItem[];
  onAddStudent: (student: User) => void;
  onBulkAddStudents?: (students: User[]) => void;
  onRemoveStudent: (id: string) => void;
  onUpdateStudent: (id: string, updated: Partial<User>) => void;
  onApproveRequest: (id: string) => void;
  onApproveAllRequests: () => void;
  onRejectRequest: (id: string) => void;
  onUpdateClassroom: (updated: Partial<Classroom>) => void;
  onApprovePasswordReset?: (reqId: string, studentId: string) => void;
  onRejectPasswordReset?: (reqId: string) => void;
  onAdminResetPassword?: (studentId: string, tempPassword?: string) => void;
  onResetRoomData?: () => Promise<void>;
  onDeleteDocument?: (docId: string) => void;
}
