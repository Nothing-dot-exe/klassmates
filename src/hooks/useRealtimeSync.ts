import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getConversationKey, parseMessageRow, getCurrentSessionUserId, recordDeletedMessageId, isMessageDeleted } from '@/lib/chatUtils';
import {
  getRealtimeChannel,
  getUserRealtimeChannel,
  removeRealtimeChannel,
  TypingPayload,
  applySafeStudentBroadcastUpdate,
} from '@/lib/realtimeService';
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
      try {
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
        const data = await Promise.race([loadInitialClassroomData(classroom.id), timeoutPromise]);
        if (!isMounted) return;

        if (data) {
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
        }
      } catch (err) {
        console.warn('initData error or timeout:', err);
      } finally {
        if (isMounted) {
          setIsDataLoaded(true);
        }
      }
    };

    initData();

    const handleIncomingMessage = (newMsg: ChatMessage) => {
      if (!newMsg || !newMsg.id || isMessageDeleted(newMsg.id)) {
        return;
      }
      const sessionUserId = getCurrentSessionUserId();

      // Privacy check: If message is a 1-on-1 direct message:
      // 1. If session user is unauthenticated or not yet loaded, drop it immediately.
      // 2. If session user is NEITHER the sender NOR the recipient, drop it immediately.
      if (!newMsg.channelId && newMsg.recipientId) {
        if (!sessionUserId || (newMsg.senderId !== sessionUserId && newMsg.recipientId !== sessionUserId)) {
          return;
        }
      }

      // Store message strictly under its canonical key (e.g. 'chn_general' or 'dm_minId_maxId')
      // Direct messages are strictly pair-isolated; never index under single-user alias keys
      const key = getConversationKey(newMsg.channelId, newMsg.senderId, newMsg.recipientId);

      setMessages((prev) => {
        const existing = prev[key] || [];
        if (existing.some((m) => m.id === newMsg.id)) {
          return prev;
        }
        return {
          ...prev,
          [key]: [...existing, newMsg],
        };
      });

      // Dispatch notification event ONLY if:
      // 1. Current user is not the sender
      // 2. If it is a DM, current user IS the intended recipient
      if (typeof window !== 'undefined' && sessionUserId && newMsg.senderId !== sessionUserId) {
        const isEligibleNotification = newMsg.channelId || newMsg.recipientId === sessionUserId;
        if (isEligibleNotification) {
          window.dispatchEvent(new CustomEvent('classmate:new_incoming_message', { detail: newMsg }));
        }
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
          // Public classroom channel strictly processes group messages; ignore any stray direct messages
          if (msg && isMounted) {
            if (!msg.channelId && msg.recipientId) {
              return;
            }
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
                return prev.map((s) =>
                  s.id === updatedStudent.id ? applySafeStudentBroadcastUpdate(s, updatedStudent) : s
                );
              }
              return prev;
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
          const { userId, userName, userAvatar, conversationKey, isTyping, recipientId } = payload as any;
          const currentUserId = getCurrentSessionUserId();
          if (recipientId && currentUserId && recipientId !== currentUserId && userId !== currentUserId) {
            return;
          }
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
            recordDeletedMessageId(messageId);
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
              recordDeletedMessageId(deletedId);
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
              const isSessionAdmin = Boolean(
                currentSessionUserId &&
                (currentSessionUserId === classroom.adminId || currentSessionUserId === row.admin_id)
              );
              setClassroom((prev) => ({
                ...prev,
                name: row.name || prev.name,
                code: row.code || prev.code,
                section: row.section || prev.section,
                semester: row.semester || prev.semester,
                institution: row.institution || prev.institution,
                autoDeleteSetting: row.auto_delete_setting || prev.autoDeleteSetting,
                requireApproval: row.require_approval !== undefined ? row.require_approval : prev.requireApproval,
                adminPassword: isSessionAdmin ? (row.admin_password || prev.adminPassword) : (isSessionAdmin ? prev.adminPassword : ''),
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

      // High-speed message synchronization (2.5s) to guarantee zero message lag
      const syncMessages = async () => {
        if (!isMounted || !classroom.id) return;
        try {
          const dbMsgs = await dbFetchMessages(classroom.id);
          if (!dbMsgs || !isMounted) return;

          const nowTime = Date.now();
          let deletedForMeSet = new Set<string>();
          if (typeof window !== 'undefined') {
            try {
              const currentSessionUserId = getCurrentSessionUserId();
              if (currentSessionUserId) {
                const saved = JSON.parse(localStorage.getItem(`classmate_deleted_for_me_${currentSessionUserId}`) || '[]');
                deletedForMeSet = new Set(saved);
              }
            } catch {}
          }

          setMessages((prev) => {
            let hasChanges = false;
            const merged = { ...prev };

            // 1. Prune expired, deleted-for-me, or tombstoned messages from current state
            Object.entries(merged).forEach(([convKey, list]) => {
              const filtered = list.filter(
                (m) =>
                  (!m.expiresAt || new Date(m.expiresAt).getTime() > nowTime) &&
                  !deletedForMeSet.has(m.id) &&
                  !isMessageDeleted(m.id)
              );
              if (filtered.length !== list.length) {
                merged[convKey] = filtered;
                hasChanges = true;
              }
            });

            // 2. Reconcile with database messages
            Object.entries(dbMsgs).forEach(([convKey, list]) => {
              const currentList = merged[convKey] || [];

              // Exclude tombstoned, deleted-for-me, or expired records from database results
              const validDbList = list.filter(
                (m) =>
                  !deletedForMeSet.has(m.id) &&
                  !isMessageDeleted(m.id) &&
                  (!m.expiresAt || new Date(m.expiresAt).getTime() > nowTime)
              );
              const validDbIds = new Set(validDbList.map((m) => m.id));

              // Reconcile current messages: prune messages removed from Supabase,
              // while preserving in-flight optimistic messages sent within the last 15 seconds
              const reconciledCurrent = currentList.filter((m) => {
                if (deletedForMeSet.has(m.id) || isMessageDeleted(m.id)) {
                  return false;
                }
                if (validDbIds.has(m.id)) {
                  return true;
                }
                // Check if message was recently generated (< 15s) and still writing to Supabase
                if (m.id.startsWith('msg_')) {
                  const parts = m.id.split('_');
                  const ts = parseInt(parts[1], 10);
                  if (!isNaN(ts) && nowTime - ts < 15000) {
                    return true;
                  }
                }
                return false;
              });

              const reconciledIds = new Set(reconciledCurrent.map((m) => m.id));
              const newItems = validDbList.filter((m) => !reconciledIds.has(m.id));

              if (newItems.length > 0 || reconciledCurrent.length !== currentList.length) {
                merged[convKey] = [...reconciledCurrent, ...newItems];
                hasChanges = true;
              }
            });

            return hasChanges ? merged : prev;
          });
        } catch {
          // quiet fallback
        }
      };

      // Periodic full sync (20s) for classroom metadata, pending enrollment requests, and roster
      const performFullSync = async () => {
        if (!isMounted || !classroom.id) return;
        try {
          const activeClass = await dbFetchClassroom(classroom.id);
          if (activeClass && isMounted) {
            setClassroom((prev) => ({ ...prev, ...activeClass }));
          }

          const [dbReqs, dbResets, dbStuds] = await Promise.all([
            dbFetchPendingRequests(classroom.id),
            dbFetchPasswordResetRequests(classroom.id),
            dbFetchStudents(classroom.id),
          ]);

          if (!isMounted) return;
          if (dbReqs) setPendingRequests(dbReqs);
          if (dbResets) setPasswordResetRequests(dbResets);
          if (dbStuds && dbStuds.length > 0) setStudents(dbStuds);
        } catch {
          // quiet fallback
        }
      };

      // 2.5s fast message polling fallback (adapts to 10s when tab is hidden)
      const messageInterval = setInterval(() => {
        if (typeof document !== 'undefined' && document.hidden) {
          return;
        }
        syncMessages();
      }, 2500);

      const backgroundInterval = setInterval(() => {
        if (typeof document !== 'undefined' && document.hidden) {
          syncMessages();
        }
      }, 10000);

      const fullSyncInterval = setInterval(performFullSync, 20000);

      const handleFocus = () => {
        syncMessages();
        performFullSync();
      };

      const handleVisibilityChange = () => {
        if (typeof document !== 'undefined' && !document.hidden) {
          syncMessages();
        }
      };

      const handleOnline = () => {
        if (channel && (channel.state === 'closed' || channel.state === 'errored')) {
          channel.subscribe();
        }
        syncMessages();
        performFullSync();
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('focus', handleFocus);
        window.addEventListener('online', handleOnline);
      }
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', handleVisibilityChange);
      }

      return () => {
        isMounted = false;
        clearInterval(messageInterval);
        clearInterval(backgroundInterval);
        clearInterval(fullSyncInterval);
        if (typeof window !== 'undefined') {
          window.removeEventListener('focus', handleFocus);
          window.removeEventListener('online', handleOnline);
        }
        if (typeof document !== 'undefined') {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
        removeRealtimeChannel();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [classroom.id]);
}
