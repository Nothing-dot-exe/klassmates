import {
  dbFetchClassroom,
  dbFetchLatestClassroom,
  dbFetchStudents,
  dbDeleteStudent,
  dbFetchMessages,
  dbFetchDocuments,
  dbFetchPendingRequests,
  dbFetchPasswordResetRequests,
} from '@/lib/databaseService';
import { Classroom, User, DocumentItem, ChatMessage, PendingRequest, PasswordResetRequest } from '@/types';

export interface LoadedClassroomData {
  activeClass: Classroom | null;
  students: User[];
  messages: Record<string, ChatMessage[]>;
  documents: DocumentItem[];
  pendingRequests: PendingRequest[];
  passwordResetRequests: PasswordResetRequest[];
}

export async function loadInitialClassroomData(
  currentClassroomId?: string
): Promise<LoadedClassroomData> {
  try {
    let activeClass = currentClassroomId ? await dbFetchClassroom(currentClassroomId) : null;
    if (!activeClass) {
      activeClass = await dbFetchLatestClassroom();
    }

    const targetId = activeClass?.id || currentClassroomId;
    if (!targetId) {
      return {
        activeClass,
        students: [],
        messages: {},
        documents: [],
        pendingRequests: [],
        passwordResetRequests: [],
      };
    }

    const [dbStuds, dbMsgs, dbDocs, dbReqs, dbResets] = await Promise.all([
      dbFetchStudents(targetId),
      dbFetchMessages(targetId),
      dbFetchDocuments(targetId),
      dbFetchPendingRequests(targetId),
      dbFetchPasswordResetRequests(targetId),
    ]);

    let cleanedStudents = dbStuds || [];
    if (dbStuds && dbStuds.length > 0) {
      const customAdmin = dbStuds.find(
        (s) => s.id !== 'usr_admin' && (s.role === 'admin' || s.id === activeClass?.adminId)
      );
      if (customAdmin && dbStuds.some((s) => s.id === 'usr_admin')) {
        cleanedStudents = dbStuds.filter((s) => s.id !== 'usr_admin');
        dbDeleteStudent('usr_admin', targetId);
      }
    }

    return {
      activeClass,
      students: cleanedStudents,
      messages: dbMsgs || {},
      documents: dbDocs || [],
      pendingRequests: dbReqs || [],
      passwordResetRequests: dbResets || [],
    };
  } catch (err) {
    console.warn('Could not sync with Supabase (running offline mode):', err);
    return {
      activeClass: null,
      students: [],
      messages: {},
      documents: [],
      pendingRequests: [],
      passwordResetRequests: [],
    };
  }
}
