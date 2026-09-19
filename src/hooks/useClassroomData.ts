import { useState } from 'react';
import {
  INITIAL_CLASSROOM,
  INITIAL_CHANNELS,
  INITIAL_STUDENTS,
  INITIAL_DOCUMENTS,
  INITIAL_MESSAGES,
  INITIAL_PENDING_REQUESTS,
  INITIAL_PASSWORD_RESET_REQUESTS,
} from '@/lib/mockData';
import {
  Classroom,
  Channel,
  User,
  DocumentItem,
  ChatMessage,
  PendingRequest,
  PasswordResetRequest,
} from '@/types';
import { broadcastTyping } from '@/lib/realtimeService';
import { useRealtimeSync } from './useRealtimeSync';

export function useClassroomData() {
  const [classroom, setClassroom] = useState<Classroom>(INITIAL_CLASSROOM);
  const [channels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [students, setStudents] = useState<User[]>(INITIAL_STUDENTS);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>(INITIAL_PENDING_REQUESTS);
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>(INITIAL_PASSWORD_RESET_REQUESTS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [typingUsers, setTypingUsers] = useState<
    Record<string, { userId: string; userName: string; userAvatar?: string; conversationKey: string }>
  >({});
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useRealtimeSync({
    classroom,
    setClassroom,
    setStudents,
    setMessages,
    setDocuments,
    setPendingRequests,
    setPasswordResetRequests,
    setTypingUsers,
    setOnlineUserIds,
    setIsDataLoaded,
  });

  const sendTypingStatus = (isTyping: boolean, conversationKey: string, user: User | null, recipientId?: string) => {
    if (!user || !user.id || !classroom.id) return;
    broadcastTyping(
      {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        conversationKey,
        isTyping,
      },
      classroom.id,
      recipientId
    );
  };

  return {
    classroom,
    setClassroom,
    channels,
    students,
    setStudents,
    pendingRequests,
    setPendingRequests,
    passwordResetRequests,
    setPasswordResetRequests,
    documents,
    setDocuments,
    messages,
    setMessages,
    typingUsers,
    sendTypingStatus,
    onlineUserIds,
    isDataLoaded,
  };
}
