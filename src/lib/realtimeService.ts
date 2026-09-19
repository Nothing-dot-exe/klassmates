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
    config: { broadcast: { self: false } },
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
    config: { broadcast: { self: false } },
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
 * Broadcasts a newly sent chat message over WebSocket (< 50ms delivery).
 * Direct messages are strictly routed to the recipient's private channel.
 */
export function broadcastNewMessage(message: ChatMessage, classroomId: string) {
  if (!isSupabaseConfigured() || !supabase) return;

  if (message.recipientId) {
    // 1-on-1 Direct Message: dispatch strictly to recipient's private channel
    const targetChannel = supabase.channel(`classmate_user_${message.recipientId}`);
    targetChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        targetChannel.send({
          type: 'broadcast',
          event: 'new_message',
          payload: message,
        }).then(() => {
          supabase?.removeChannel(targetChannel);
        });
      }
    });
    return;
  }

  // Public channel message: broadcast over classroom-wide channel
  const channel = getRealtimeChannel(classroomId);
  if (channel) {
    channel
      .send({
        type: 'broadcast',
        event: 'new_message',
        payload: message,
      })
      .catch((err) => console.warn('Realtime message broadcast failed:', err));
  }
}

/**
 * Broadcasts user typing status across active participants in real-time.
 * In DMs, typing status is sent strictly to the recipient's private channel.
 */
export function broadcastTyping(payload: TypingPayload, classroomId: string, recipientId?: string) {
  if (!isSupabaseConfigured() || !supabase) return;

  if (recipientId) {
    const targetChannel = supabase.channel(`classmate_user_${recipientId}`);
    targetChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        targetChannel.send({
          type: 'broadcast',
          event: 'typing_status',
          payload,
        }).then(() => {
          supabase?.removeChannel(targetChannel);
        });
      }
    });
    return;
  }

  const channel = getRealtimeChannel(classroomId);
  if (channel) {
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

/**
 * Broadcasts when a student or admin updates their profile (avatar, nickname, name, bio)
 * so all connected classmates immediately receive the new avatar/name in real-time.
 */
export function broadcastStudentUpdated(student: User, classroomId: string) {
  const channel = getRealtimeChannel(classroomId);
  if (channel) {
    channel
      .send({
        type: 'broadcast',
        event: 'student_updated',
        payload: { student },
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



