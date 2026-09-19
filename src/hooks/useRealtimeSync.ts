import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getConversationKey, parseMessageRow, getCurrentSessionUserId } from '@/lib/chatUtils';
import { getRealtimeChannel, getUserRealtimeChannel, removeRealtimeChannel, TypingPayload } from '@/lib/realtimeService';
import {
  dbFetchClassroom,
  dbFetchStudents,
  dbFetchMessages,
  dbFetchPendingRequests,
  dbFetchPasswordResetRequests,
} from '@/lib/databaseService';
import { Classroom, User, DocumentItem, ChatMessage, PendingRequest, PasswordResetRequest } from '@/types';
import { EMPTY_CLASSROOM } from '@/lib/mockData';
import { loadInitialClassroomData } from './classroomDataLoader';

interface UseRealtimeSyncParams {
  classroom: Classroom;
  setClassroom: React.Dispatch<React.SetStateAction<Classroom>>;
  setStudents: React.Dispatch<React.SetStateAction<User[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  setPendingRequests: React.Dispatch<React.SetStateAction<PendingRequest[]>>;
  setPasswordResetRequests: React.Dispatch<React.SetStateAction<PasswordResetRequest[]>>;
  setTypingUsers: React.Dispatch<React.SetStateAction<Record<string, { userId: string; userName: string; userAvatar?: string; conversationKey: string }>>>;
  setOnlineUserIds?: React.Dispatch<React.SetStateAction<Set<string>>>;
  setIsDataLoaded: (loaded: boolean) => void;
}

export function useRealtimeSync({
  classroom, setClassroom, setStudents, setMessages, setDocuments,
  setPendingRequests, setPasswordResetRequests, setTypingUsers, setOnlineUserIds, setIsDataLoaded,
}: UseRealtimeSyncParams) {
  const typingTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsDataLoaded(true);
      return;
    }

    let isMounted = true;

    const initData = async () => {
      const data = await loadInitialClassroomData(classroom.id);
      if (!isMounted) return;

      if (data.activeClass) {
        setClassroom(data.activeClass);
      }

      if (data.students && data.students.length > 0) {
        setStudents(data.students);
      }
      if (data.messages && Object.keys(data.messages).length > 0) {
        setMessages(data.messages);
      }
      if (data.documents) setDocuments(data.documents);
      if (data.pendingRequests) setPendingRequests(data.pendingRequests);
      if (data.passwordResetRequests) setPasswordResetRequests(data.passwordResetRequests);
      setIsDataLoaded(true);
    };

    initData();

    const handleIncomingMessage = (newMsg: ChatMessage) => {
      // Privacy check: If message is a 1-on-1 direct message, only process if session user is sender or recipient
      const sessionUserId = getCurrentSessionUserId();
      if (!newMsg.channelId && newMsg.recipientId) {
        if (sessionUserId && newMsg.senderId !== sessionUserId && newMsg.recipientId !== sessionUserId) {
          return;
        }
      }

      const key = getConversationKey(newMsg.channelId, newMsg.senderId, newMsg.recipientId);
      const targetKeys = [key];
      if (!newMsg.channelId) {
        if (newMsg.recipientId) targetKeys.push(`dm_${newMsg.recipientId}`);
        if (newMsg.senderId) targetKeys.push(`dm_${newMsg.senderId}`);
      }

      setMessages((prev) => {
        const updated = { ...prev };
        let hasNew = false;
        targetKeys.forEach((k) => {
          const existing = updated[k] || [];
          if (!existing.some((m) => m.id === newMsg.id)) {
            updated[k] = [...existing, newMsg];
            hasNew = true;
          }
        });
        return hasNew ? updated : prev;
      });

      // Dispatch social media notification event for app-level banner toast
      if (typeof window !== 'undefined' && currentSessionUserId && newMsg.senderId !== currentSessionUserId) {
        window.dispatchEvent(new CustomEvent('classmate:new_incoming_message', { detail: newMsg }));
      }
    };

    const currentSessionUserId = getCurrentSessionUserId();
    const userChannel = currentSessionUserId ? getUserRealtimeChannel(currentSessionUserId) : null;

    if (userChannel) {
      userChannel
        .on('broadcast', { event: 'new_message' }, ({ payload }) => {
          if (payload && isMounted) handleIncomingMessage(payload as ChatMessage);
        })
        .on('broadcast', { event: 'typing_status' }, ({ payload }) => {
          if (!payload || !isMounted) return;
          const { userId, userName, userAvatar, conversationKey, isTyping } = payload as TypingPayload;
          if (typingTimeoutsRef.current[userId]) clearTimeout(typingTimeoutsRef.current[userId]);

          if (!isTyping) {
            setTypingUsers((prev) => {
              if (!prev[userId]) return prev;
              const next = { ...prev };
              delete next[userId];
              return next;
            });
          } else {
            setTypingUsers((prev) => ({
              ...prev,
              [userId]: { userId, userName, userAvatar, conversationKey },
            }));

            typingTimeoutsRef.current[userId] = setTimeout(() => {
              if (isMounted) {
                setTypingUsers((prev) => {
                  if (!prev[userId]) return prev;
                  const next = { ...prev };
                  delete next[userId];
                  return next;
                });
              }
            }, 3000);
          }
        })
        .subscribe();
    }

    const channel = getRealtimeChannel(classroom.id) || (supabase ? supabase.channel('classmate_realtime') : null);
    if (channel) {
      channel
        .on('presence', { event: 'sync' }, () => {
          if (!isMounted || !setOnlineUserIds) return;
          const presenceState = channel.presenceState();
          const activeIds = new Set<string>();
          if (currentSessionUserId) activeIds.add(currentSessionUserId);
          Object.values(presenceState).forEach((presences) => {
            (presences as any[]).forEach((p) => {
              if (p.user_id) activeIds.add(p.user_id);
            });
          });
          setOnlineUserIds(activeIds);
        })
        .on('broadcast', { event: 'new_message' }, ({ payload }) => {
          const msg = payload as ChatMessage;
          // Public classroom channel only receives messages for group channels, never DMs
          if (msg && !msg.recipientId && isMounted) {
            handleIncomingMessage(msg);
          }
        })
        .on('broadcast', { event: 'student_removed' }, ({ payload }) => {
          const removedId = (payload as { studentId?: string })?.studentId;
          if (removedId && isMounted) {
            setStudents((prev) => prev.filter((s) => s.id !== removedId));
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('classmate:student_removed', { detail: { studentId: removedId } }));
            }
          }
        })
        .on('broadcast', { event: 'student_updated' }, ({ payload }) => {
          const updatedStudent = (payload as { student?: User })?.student;
          if (updatedStudent && isMounted) {
            setStudents((prev) => {
              const exists = prev.some((s) => s.id === updatedStudent.id);
              if (exists) {
                return prev.map((s) => (s.id === updatedStudent.id ? { ...s, ...updatedStudent } : s));
              }
              return [...prev, updatedStudent];
            });

            if (updatedStudent.avatar || updatedStudent.name) {
              setMessages((prev) => {
                const next: Record<string, ChatMessage[]> = {};
                let changed = false;
                Object.entries(prev).forEach(([channelKey, list]) => {
                  next[channelKey] = list.map((m) => {
                    if (m.senderId === updatedStudent.id) {
                      changed = true;
                      return {
                        ...m,
                        senderAvatar: updatedStudent.avatar || m.senderAvatar,
                        senderName: updatedStudent.name || m.senderName,
                      };
                    }
                    return m;
                  });
                });
                return changed ? next : prev;
              });
            }
          }
        })
        .on('broadcast', { event: 'room_reset' }, () => {
          if (isMounted) {
            setClassroom(EMPTY_CLASSROOM);
            setStudents([]);
            setMessages({});
            setDocuments([]);
            setPendingRequests([]);
            setPasswordResetRequests([]);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('classmate:room_reset'));
            }
          }
        })
        .on('broadcast', { event: 'typing_status' }, ({ payload }) => {
          if (!payload || !isMounted) return;
          const { userId, userName, userAvatar, conversationKey, isTyping } = payload as TypingPayload;
          if (typingTimeoutsRef.current[userId]) clearTimeout(typingTimeoutsRef.current[userId]);

          if (!isTyping) {
            setTypingUsers((prev) => {
              if (!prev[userId]) return prev;
              const next = { ...prev };
              delete next[userId];
              return next;
            });
          } else {
            setTypingUsers((prev) => ({
              ...prev,
              [userId]: { userId, userName, userAvatar, conversationKey },
            }));

            typingTimeoutsRef.current[userId] = setTimeout(() => {
              if (isMounted) {
                setTypingUsers((prev) => {
                  if (!prev[userId]) return prev;
                  const next = { ...prev };
                  delete next[userId];
                  return next;
                });
              }
            }, 3000);
          }
        })
        .on('broadcast', { event: 'message_reaction' }, ({ payload }) => {
          if (!payload || !isMounted) return;
          const { messageId, reactions } = payload as { messageId: string; reactions: any[] };
          setMessages((prev) => {
            const updated: Record<string, ChatMessage[]> = {};
            Object.entries(prev).forEach(([k, list]) => {
              updated[k] = list.map((m) => (m.id === messageId ? { ...m, reactions } : m));
            });
            return updated;
          });
        })
        .on('broadcast', { event: 'message_deleted' }, ({ payload }) => {
          if (!payload || !isMounted) return;
          const { messageId } = payload as { messageId: string };
          if (messageId) {
            setMessages((prev) => {
              const updated: Record<string, ChatMessage[]> = {};
              Object.entries(prev).forEach(([k, list]) => {
                updated[k] = list.filter((m) => m.id !== messageId);
              });
              return updated;
            });
          }
        })
        .on('broadcast', { event: 'clear_chat' }, ({ payload }) => {
          if (!payload || !isMounted) return;
          const { conversationKey } = payload as { conversationKey: string };
          if (conversationKey) {
            setMessages((prev) => ({
              ...prev,
              [conversationKey]: [],
            }));
          }
        })
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `classroom_id=eq.${classroom.id}` },
          (payload) => {
            handleIncomingMessage(parseMessageRow(payload.new));
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'messages', filter: `classroom_id=eq.${classroom.id}` },
          (payload) => {
            const deletedId = (payload.old as any)?.id;
            if (deletedId && isMounted) {
              setMessages((prev) => {
                const updated: Record<string, ChatMessage[]> = {};
                Object.entries(prev).forEach(([k, list]) => {
                  updated[k] = list.filter((m) => m.id !== deletedId);
                });
                return updated;
              });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'students', filter: `classroom_id=eq.${classroom.id}` },
          async (payload) => {
            if (payload.eventType === 'DELETE') {
              const delId = (payload.old as any)?.id;
              if (delId && isMounted) {
                setStudents((prev) => prev.filter((s) => s.id !== delId));
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('classmate:student_removed', { detail: { studentId: delId } }));
                }
              }
            }
            const dbStuds = await dbFetchStudents(classroom.id);
            if (dbStuds && dbStuds.length > 0 && isMounted) setStudents(dbStuds);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'pending_requests', filter: `classroom_id=eq.${classroom.id}` },
          async () => {
            const dbReqs = await dbFetchPendingRequests(classroom.id);
            if (dbReqs && isMounted) setPendingRequests(dbReqs);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'password_reset_requests', filter: `classroom_id=eq.${classroom.id}` },
          async () => {
            const dbResets = await dbFetchPasswordResetRequests(classroom.id);
            if (dbResets && isMounted) setPasswordResetRequests(dbResets);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'classrooms', filter: `id=eq.${classroom.id}` },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              if (isMounted) {
                setClassroom(EMPTY_CLASSROOM);
                setStudents([]);
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('classmate:room_reset'));
                }
              }
              return;
            }
            const row = payload.new as any;
            if (row && isMounted) {
              setClassroom((prev) => ({
                ...prev,
                name: row.name || prev.name,
                code: row.code || prev.code,
                section: row.section || prev.section,
                semester: row.semester || prev.semester,
                institution: row.institution || prev.institution,
                autoDeleteSetting: row.auto_delete_setting || prev.autoDeleteSetting,
                requireApproval: row.require_approval !== undefined ? row.require_approval : prev.requireApproval,
                adminPassword: row.admin_password || prev.adminPassword,
              }));
            }
          }
        );

      if (channel.state !== 'joined' && channel.state !== 'joining') {
        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && currentSessionUserId) {
            try {
              await channel.track({
                user_id: currentSessionUserId,
                online_at: new Date().toISOString(),
              });
            } catch (err) {
              console.warn('Presence track error:', err);
            }
          }
        });
      } else if (currentSessionUserId) {
        try {
          channel.track({
            user_id: currentSessionUserId,
            online_at: new Date().toISOString(),
          });
        } catch {
          // ignore
        }
      }

      // Efficient periodic heartbeat (30s) and immediate window focus resync to prevent excessive database load
      const performSync = async () => {
        if (!isMounted || !classroom.id) return;
        try {
          const activeClass = await dbFetchClassroom(classroom.id);
          if (activeClass && isMounted) {
            setClassroom((prev) => ({ ...prev, ...activeClass }));
          }

          const [dbReqs, dbResets, dbStuds, dbMsgs] = await Promise.all([
            dbFetchPendingRequests(classroom.id),
            dbFetchPasswordResetRequests(classroom.id),
            dbFetchStudents(classroom.id),
            dbFetchMessages(classroom.id),
          ]);

          if (!isMounted) return;
          if (dbReqs) setPendingRequests(dbReqs);
          if (dbResets) setPasswordResetRequests(dbResets);
          if (dbStuds && dbStuds.length > 0) setStudents(dbStuds);

          if (dbMsgs) {
            const nowTime = Date.now();
            setMessages((prev) => {
              let hasChanges = false;
              const merged = { ...prev };
              Object.entries(merged).forEach(([convKey, list]) => {
                const unexpired = list.filter((m) => !m.expiresAt || new Date(m.expiresAt).getTime() > nowTime);
                if (unexpired.length !== list.length) {
                  merged[convKey] = unexpired;
                  hasChanges = true;
                }
              });
              Object.entries(dbMsgs).forEach(([convKey, list]) => {
                const currentList = merged[convKey] || [];
                const currentIds = new Set(currentList.map((m) => m.id));
                const newItems = list.filter((m) => !currentIds.has(m.id));
                if (newItems.length > 0) {
                  merged[convKey] = [...currentList, ...newItems];
                  hasChanges = true;
                }
              });
              return hasChanges ? merged : prev;
            });
          }
        } catch {
          // quiet fallback
        }
      };

      const syncInterval = setInterval(performSync, 30000);

      const handleFocus = () => {
        performSync();
      };
      if (typeof window !== 'undefined') {
        window.addEventListener('focus', handleFocus);
      }

      return () => {
        isMounted = false;
        clearInterval(syncInterval);
        if (typeof window !== 'undefined') {
          window.removeEventListener('focus', handleFocus);
        }
        removeRealtimeChannel();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [classroom.id]);
}
