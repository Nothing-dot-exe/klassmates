/**
 * CHAT UTILITIES
 * Canonical conversation routing for group channels and 1-on-1 direct messages (DMs).
 */

/**
 * Generates a deterministic canonical conversation key for 1-on-1 direct messages.
 * Regardless of who is sender or recipient (User A -> User B or User B -> User A),
 * this function always returns the exact same identifier: `dm_${minId}_${maxId}`.
 */
export function getDmConversationKey(userAId?: string | null, userBId?: string | null): string {
  const a = (userAId || '').trim();
  const b = (userBId || '').trim();
  if (!a && !b) return 'dm_unknown';
  if (!a) return `dm_${b}`;
  if (!b) return `dm_${a}`;
  const sorted = [a, b].sort();
  return `dm_${sorted[0]}_${sorted[1]}`;
}

/**
 * Returns the conversation key for either a channel or a direct message.
 */
export function getConversationKey(
  channelId?: string | null,
  senderId?: string | null,
  recipientId?: string | null
): string {
  if (channelId) return channelId;
  return getDmConversationKey(senderId, recipientId);
}

import { ChatMessage } from '@/types';

/**
 * Parses a raw database row into a structured ChatMessage object.
 */
export function parseMessageRow(row: any): ChatMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderRollNo: row.sender_roll_no,
    senderAvatar: row.sender_avatar,
    content: row.content,
    timestamp: row.timestamp,
    channelId: row.channel_id || undefined,
    recipientId: row.recipient_id || undefined,
    isEncrypted: row.is_encrypted,
    autoDelete: row.auto_delete,
    expiresAt: row.expires_at || undefined,
    imageUrl: row.image_url || undefined,
    document: row.document || undefined,
    reactions: row.reactions || [],
    replyTo: row.reply_to || undefined,
  };
}

/**
 * Retrieves the currently active user ID from client storage (localStorage / sessionStorage).
 * Used to filter private DMs so other students cannot see 1-on-1 conversations they are not part of.
 */
export function getCurrentSessionUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const adminSessionStr = sessionStorage.getItem('classmate_admin_session');
    if (adminSessionStr) {
      const parsed = JSON.parse(adminSessionStr);
      if (parsed && parsed.id) return parsed.id;
    }
    const savedUserStr = localStorage.getItem('classmate_current_user');
    if (savedUserStr) {
      const parsed = JSON.parse(savedUserStr);
      if (parsed && parsed.id) return parsed.id;
    }
  } catch {
    // quiet
  }
  return null;
}
