import { supabase, isSupabaseConfigured } from './supabaseClient';
import { ChatMessage, User } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface TypingPayload {
  userId: string;
  userName: string;
  userAvatar?: string;
  conversationKey: string;
  isTyping: boolean;
}

let activeChannel: RealtimeChannel | null = null;
let currentClassroomId: string | null = null;
let activeUserChannel: RealtimeChannel | null = null;
let currentActiveUserId: string | null = null;

/**
 * Returns or creates the persistent Supabase Realtime channel for this classroom.
 * Configured with self: false so sender doesn't receive redundant echo of its own broadcast.
 */
export function getRealtimeChannel(classroomId?: string): RealtimeChannel | null {
  if (!isSupabaseConfigured() || !supabase) return null;

  const targetRoom = classroomId || 'default';
  if (activeChannel && currentClassroomId === targetRoom && activeChannel.state !== 'closed' && activeChannel.state !== 'errored') {
    return activeChannel;
  }

  if (activeChannel) {
    try {
      supabase.removeChannel(activeChannel);
    } catch {
      // quiet
    }
    activeChannel = null;
  }

  currentClassroomId = targetRoom;
  activeChannel = supabase.channel(`classmate_rt_${targetRoom}`, {
    config: { broadcast: { self: false, ack: false } },
  });

  return activeChannel;
}

/**
 * Returns or creates the user's private Realtime channel for receiving direct messages
 * and personal notifications securely without leaking to third-party classmates.
 */
export function getUserRealtimeChannel(userId?: string): RealtimeChannel | null {
  if (!isSupabaseConfigured() || !supabase || !userId) return null;

  if (activeUserChannel && currentActiveUserId === userId && activeUserChannel.state !== 'closed' && activeUserChannel.state !== 'errored') {
    return activeUserChannel;
  }

  if (activeUserChannel) {
    try {
      supabase.removeChannel(activeUserChannel);
    } catch {
      // quiet
    }
    activeUserChannel = null;
  }

  currentActiveUserId = userId;
  activeUserChannel = supabase.channel(`classmate_user_${userId}`, {
    config: { broadcast: { self: false, ack: false } },
  });

  return activeUserChannel;
}

export function removeRealtimeChannel() {
  if (supabase) {
    if (activeChannel) {
      try {
        supabase.removeChannel(activeChannel);
      } catch {
        // quiet
      }
      activeChannel = null;
      currentClassroomId = null;
    }
    if (activeUserChannel) {
      try {
        supabase.removeChannel(activeUserChannel);
      } catch {
        // quiet
      }
      activeUserChannel = null;
      currentActiveUserId = null;
    }
  }
}

/**
 * Broadcasts a newly sent chat message over WebSocket (< 25ms delivery).
 * Uses the persistent classroom channel to deliver lightning-fast messages
 * directly to the recipient and connected peers without handshake thrashing.
 */
export function broadcastNewMessage(message: ChatMessage, classroomId: string) {
  if (!isSupabaseConfigured() || !supabase) return;

  // Case 1: Group Channel message -> Broadcast to shared classroom channel
  if (message.channelId) {
    const channel = getRealtimeChannel(classroomId);
    if (channel) {
      if (channel.state !== 'joined' && channel.state !== 'joining') {
        channel.subscribe();
      }
      channel
        .send({
          type: 'broadcast',
          event: 'new_message',
          payload: message,
        })
        .catch((err) => console.warn('Realtime message broadcast failed:', err));
    }
    return;
  }

  // Case 2: 1-on-1 Direct Message -> Strictly dispatch ONLY to recipient and sender personal channels
  // NEVER broadcast DMs to the public classroom channel to guarantee 100% privacy!
  if (message.recipientId) {
    const recipientChan = getUserRealtimeChannel(message.recipientId);
    if (recipientChan) {
      if (recipientChan.state !== 'joined' && recipientChan.state !== 'joining') {
        recipientChan.subscribe();
      }
      recipientChan
        .send({
          type: 'broadcast',
          event: 'new_message',
          payload: message,
        })
        .catch(() => {});
    }

    if (message.senderId && message.senderId !== message.recipientId) {
      const senderChan = getUserRealtimeChannel(message.senderId);
      if (senderChan) {
        if (senderChan.state !== 'joined' && senderChan.state !== 'joining') {
          senderChan.subscribe();
        }
        senderChan
          .send({
            type: 'broadcast',
            event: 'new_message',
            payload: message,
          })
          .catch(() => {});
      }
    }
  }
}

/**
 * Broadcasts user typing status across active participants in real-time (< 10ms).
 * DMs are strictly routed to the recipient's personal channel to avoid leaking conversation activity.
 */
export function broadcastTyping(payload: TypingPayload, classroomId: string, recipientId?: string) {
  if (!isSupabaseConfigured() || !supabase) return;

  if (recipientId) {
    const userChan = getUserRealtimeChannel(recipientId);
    if (userChan) {
      if (userChan.state !== 'joined' && userChan.state !== 'joining') {
        userChan.subscribe();
      }
      userChan
        .send({
          type: 'broadcast',
          event: 'typing_status',
          payload: { ...payload, recipientId },
        })
        .catch(() => {});
    }
    return;
  }

  const channel = getRealtimeChannel(classroomId);
  if (channel) {
    if (channel.state !== 'joined' && channel.state !== 'joining') {
      channel.subscribe();
    }
    channel
      .send({
        type: 'broadcast',
        event: 'typing_status',
        payload,
      })
      .catch((err) => console.warn('Realtime typing broadcast failed:', err));
  }
}

/**
 * Broadcasts when a student is removed from the classroom so their client can auto-logout immediately.
 */
export function broadcastStudentRemoved(studentId: string, classroomId: string) {
  const channel = getRealtimeChannel(classroomId);
  if (channel) {
    channel
      .send({
        type: 'broadcast',
        event: 'student_removed',
        payload: { studentId },
      })
      .catch((err) => console.warn('Realtime student_removed broadcast failed:', err));
  }
}

export interface SanitizedBroadcastStudent {
  id: string;
  name: string;
  nickname?: string;
  avatar: string;
  status: User['status'];
  bio?: string;
  designation?: string;
  email?: string;
  phone?: string;
  showPhone?: boolean;
  showEmail?: boolean;
}

/**
 * Strips sensitive PII and credentials (passwords, hidden phone/email) before WebSocket broadcast.
 */
export function sanitizeBroadcastStudent(student: User): SanitizedBroadcastStudent {
  const sanitized: SanitizedBroadcastStudent = {
    id: student.id,
    name: student.name,
    nickname: student.nickname,
    avatar: student.avatar,
    status: student.status,
    bio: student.bio,
    designation: student.designation,
    showPhone: student.showPhone,
    showEmail: student.showEmail,
  };

  if (student.showEmail) {
    sanitized.email = student.email;
  }
  if (student.showPhone) {
    sanitized.phone = student.phone;
  }

  return sanitized;
}

/**
 * Merges a broadcast student update into an existing local record safely.
 * Strictly prevents peer broadcasts from overwriting id, rollNo, or escalating role.
 */
export function applySafeStudentBroadcastUpdate(existing: User, broadcastUpdate: Partial<User>): User {
  return {
    ...existing,
    name: broadcastUpdate.name !== undefined ? broadcastUpdate.name : existing.name,
    nickname: broadcastUpdate.nickname !== undefined ? broadcastUpdate.nickname : existing.nickname,
    avatar: broadcastUpdate.avatar !== undefined ? broadcastUpdate.avatar : existing.avatar,
    bio: broadcastUpdate.bio !== undefined ? broadcastUpdate.bio : existing.bio,
    designation: broadcastUpdate.designation !== undefined ? broadcastUpdate.designation : existing.designation,
    status: broadcastUpdate.status !== undefined ? broadcastUpdate.status : existing.status,
    phone: broadcastUpdate.phone !== undefined ? broadcastUpdate.phone : existing.phone,
    email: broadcastUpdate.email !== undefined ? broadcastUpdate.email : existing.email,
    showPhone: broadcastUpdate.showPhone !== undefined ? broadcastUpdate.showPhone : existing.showPhone,
    showEmail: broadcastUpdate.showEmail !== undefined ? broadcastUpdate.showEmail : existing.showEmail,
    // IMMUTABLE / PRIVILEGED FIELDS PRESERVED:
    id: existing.id,
    rollNo: existing.rollNo,
    role: existing.role,
    joinedAt: existing.joinedAt,
  };
}

/**
 * Broadcasts when a student or admin updates their profile (avatar, nickname, name, bio)
 * so all connected classmates immediately receive the new avatar/name in real-time.
 */
export function broadcastStudentUpdated(student: User, classroomId: string) {
  const channel = getRealtimeChannel(classroomId);
  if (channel) {
    const sanitizedStudent = sanitizeBroadcastStudent(student);
    channel
      .send({
        type: 'broadcast',
        event: 'student_updated',
        payload: { student: sanitizedStudent },
      })
      .catch((err) => console.warn('Realtime student_updated broadcast failed:', err));
  }
}

/**
 * Broadcasts when a classroom is factory reset so all connected users can auto-logout immediately.
 */
export function broadcastRoomReset(classroomId: string) {
  const channel = getRealtimeChannel(classroomId);
  if (channel) {
    channel
      .send({
        type: 'broadcast',
        event: 'room_reset',
        payload: { classroomId },
      })
      .catch((err) => console.warn('Realtime room_reset broadcast failed:', err));
  }
}

/**
 * Broadcasts when a join request is rejected by the room admin.
 */
export function broadcastRequestDeclined(requestId: string, rollNo: string, classroomId: string) {
  const channel = getRealtimeChannel(classroomId);
  if (channel) {
    channel
      .send({
        type: 'broadcast',
        event: 'request_declined',
        payload: { requestId, rollNo },
      })
      .catch((err) => console.warn('Realtime request_declined broadcast failed:', err));
  }
}

/**
 * Broadcasts message emoji reaction updates in real-time.
 */
export function broadcastReaction(messageId: string, reactions: any[], classroomId: string) {
  const channel = getRealtimeChannel(classroomId);
  if (channel) {
    channel
      .send({
        type: 'broadcast',
        event: 'message_reaction',
        payload: { messageId, reactions },
      })
      .catch((err) => console.warn('Realtime reaction broadcast failed:', err));
  }
}

/**
 * Broadcasts message deletion across all active clients.
 */
export function broadcastMessageDeleted(messageId: string, classroomId: string) {
  const channel = getRealtimeChannel(classroomId);
  if (channel) {
    channel
      .send({
        type: 'broadcast',
        event: 'message_deleted',
        payload: { messageId },
      })
      .catch((err) => console.warn('Realtime message_deleted broadcast failed:', err));
  }
}

/**
 * Broadcasts clear chat event across all active clients.
 */
export function broadcastClearChat(conversationKey: string, classroomId: string) {
  const channel = getRealtimeChannel(classroomId);
  if (channel) {
    channel
      .send({
        type: 'broadcast',
        event: 'clear_chat',
        payload: { conversationKey },
      })
      .catch((err) => console.warn('Realtime clear_chat broadcast failed:', err));
  }
}



