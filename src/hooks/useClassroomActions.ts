import React from 'react';
import { Classroom, User, DocumentItem, ChatMessage, PendingRequest, PasswordResetRequest } from '@/types';
import { useChatActions } from './useChatActions';
import { useAdminActions } from './useAdminActions';

interface UseClassroomActionsParams {
  classroom: Classroom;
  setClassroom: React.Dispatch<React.SetStateAction<Classroom>>;
  students: User[];
  setStudents: React.Dispatch<React.SetStateAction<User[]>>;
  pendingRequests: PendingRequest[];
  setPendingRequests: React.Dispatch<React.SetStateAction<PendingRequest[]>>;
  passwordResetRequests: PasswordResetRequest[];
  setPasswordResetRequests: React.Dispatch<React.SetStateAction<PasswordResetRequest[]>>;
  documents?: DocumentItem[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  messages?: Record<string, ChatMessage[]>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>;
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  onUserLoggedIn: (u: User) => void;
  currentConversationKey: string;
  selectedChannelId: string;
  selectedDmUserId: string;
  activeView: string;
}

export function useClassroomActions({
  classroom,
  setClassroom,
  students,
  setStudents,
  pendingRequests,
  setPendingRequests,
  passwordResetRequests: _passwordResetRequests,
  setPasswordResetRequests,
  documents,
  setDocuments,
  messages,
  setMessages,
  currentUser,
  setCurrentUser,
  onUserLoggedIn,
  currentConversationKey,
  selectedChannelId,
  selectedDmUserId,
  activeView,
}: UseClassroomActionsParams) {
  const chatActions = useChatActions({
    classroomId: classroom.id,
    classroom,
    currentUser,
    currentConversationKey,
    selectedChannelId,
    selectedDmUserId,
    activeView,
    messages,
    documents,
    setMessages,
    setDocuments,
  });

  const adminActions = useAdminActions({
    classroom,
    setClassroom,
    students,
    setStudents,
    pendingRequests,
    setPendingRequests,
    setPasswordResetRequests,
    setDocuments,
    setMessages,
    currentUser,
    setCurrentUser,
    onUserLoggedIn,
  });

  return {
    ...chatActions,
    ...adminActions,
  };
}
