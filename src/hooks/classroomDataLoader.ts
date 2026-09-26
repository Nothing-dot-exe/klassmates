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
import { getCurrentSessionUserId, isMessageDeleted } from '@/lib/chatUtils';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

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
    let targetId = currentClassroomId;

    if (!targetId && typeof window !== 'undefined') {
      try {
        // 1. Check URL query code if provided
        const params = new URLSearchParams(window.location.search);
        const urlCode = params.get('code')?.toUpperCase();
        if (urlCode && isSupabaseConfigured() && supabase) {
          const { data: codeMatch } = await supabase
            .from('classrooms')
            .select('id')
            .ilike('code', urlCode)
            .maybeSingle();
          if (codeMatch?.id) {
            targetId = codeMatch.id;
          }
        }

        // 2. Check saved user session
        if (!targetId) {
          const savedUserStr =
            localStorage.getItem('classmate_current_user') ||
            sessionStorage.getItem('classmate_current_user') ||
            sessionStorage.getItem('classmate_admin_session');

          let savedUserId = '';
          if (savedUserStr) {
            const parsed = JSON.parse(savedUserStr);
            if (parsed?.classroomId) {
              targetId = parsed.classroomId;
            }
            if (parsed?.id) {
              savedUserId = parsed.id;
            }
          }

          // 3. Check saved classroom ID
          if (!targetId) {
            targetId = localStorage.getItem('classmate_classroom_id') || undefined;
          }

          // 4. If targetId still unknown but we have a saved user ID, query Supabase to find user's classroom
          if (!targetId && savedUserId && isSupabaseConfigured() && supabase) {
            const { data: studRow } = await supabase
              .from('students')
              .select('classroom_id')
              .eq('id', savedUserId)
              .maybeSingle();

            if (studRow?.classroom_id) {
              targetId = studRow.classroom_id;
              localStorage.setItem('classmate_classroom_id', studRow.classroom_id);
            } else {
              const { data: adminCls } = await supabase
                .from('classrooms')
                .select('id')
                .eq('admin_id', savedUserId)
                .maybeSingle();
              if (adminCls?.id) {
                targetId = adminCls.id;
                localStorage.setItem('classmate_classroom_id', adminCls.id);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error determining initial classroom ID:', err);
      }
    }

    let activeClass = targetId ? await dbFetchClassroom(targetId) : null;
    if (!activeClass) {
      activeClass = await dbFetchLatestClassroom();
    }

    if (activeClass?.id && typeof window !== 'undefined') {
      try {
        localStorage.setItem('classmate_classroom_id', activeClass.id);
      } catch {}
    }

    const finalTargetId = activeClass?.id || targetId;
    if (!finalTargetId) {
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
      dbFetchStudents(finalTargetId),
      dbFetchMessages(finalTargetId),
      dbFetchDocuments(finalTargetId),
      dbFetchPendingRequests(finalTargetId),
      dbFetchPasswordResetRequests(finalTargetId),
    ]);

    let cleanedStudents = dbStuds || [];
    if (dbStuds && dbStuds.length > 0) {
      const customAdmin = dbStuds.find(
        (s) => s.id !== 'usr_admin' && (s.role === 'admin' || s.id === activeClass?.adminId)
      );
      if (customAdmin && dbStuds.some((s) => s.id === 'usr_admin')) {
        cleanedStudents = dbStuds.filter((s) => s.id !== 'usr_admin');
        dbDeleteStudent('usr_admin', finalTargetId);
      }
    }

    let cleanedMessages = dbMsgs || {};
    if (typeof window !== 'undefined' && dbMsgs) {
      try {
        const currentSessionUserId = getCurrentSessionUserId();
        const saved: string[] = currentSessionUserId
          ? JSON.parse(localStorage.getItem(`classmate_deleted_for_me_${currentSessionUserId}`) || '[]')
          : [];
        const delSet = new Set(saved);
        const filtered: Record<string, ChatMessage[]> = {};
        Object.entries(dbMsgs).forEach(([k, list]) => {
          filtered[k] = list.filter((m) => !delSet.has(m.id) && !isMessageDeleted(m.id));
        });
        cleanedMessages = filtered;
      } catch {}
    }

    return {
      activeClass,
      students: cleanedStudents,
      messages: cleanedMessages,
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
