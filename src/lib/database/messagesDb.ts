import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { ChatMessage, MessageReaction } from '@/types';
import { getConversationKey, getCurrentSessionUserId } from '../chatUtils';

/**
 * MESSAGES DATABASE OPERATIONS
 */

export const dbFetchMessages = async (classroomId: string): Promise<Record<string, ChatMessage[]> | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const sessionUserId = getCurrentSessionUserId();
    const nowIso = new Date().toISOString();

    // Scope expired-message cleanup strictly to this classroom
    (async () => {
      try {
        await supabase
          .from('messages')
          .delete()
          .eq('classroom_id', classroomId)
          .not('expires_at', 'is', null)
          .lte('expires_at', nowIso);
      } catch {
        // quiet
      }
    })();

    let query = supabase
      .from('messages')
      .select('*')
      .eq('classroom_id', classroomId);

    // Privacy at query level: Only download channel messages or DMs involving the current student
    if (sessionUserId) {
      query = query.or(`channel_id.not.is.null,sender_id.eq.${sessionUserId},recipient_id.eq.${sessionUserId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error || !data) return null;

    const grouped: Record<string, ChatMessage[]> = {
      chn_general: [],
    };
    const nowTime = Date.now();

    data.forEach((row) => {
      if (row.expires_at) {
        const expTime = new Date(row.expires_at).getTime();
        if (!isNaN(expTime) && expTime <= nowTime) {
          return;
        }
      }
      const msg: ChatMessage = {
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

      // Defense-in-depth: Double check DM privacy
      if (!msg.channelId && msg.recipientId) {
        if (sessionUserId && msg.senderId !== sessionUserId && msg.recipientId !== sessionUserId) {
          return;
        }
      }

      const key = getConversationKey(msg.channelId, msg.senderId, msg.recipientId);
      const targetKeys = [key];

      // Support legacy alias lookups (e.g., dm_${otherUserId})
      if (!msg.channelId) {
        if (msg.recipientId) targetKeys.push(`dm_${msg.recipientId}`);
        if (msg.senderId) targetKeys.push(`dm_${msg.senderId}`);
      }

      targetKeys.forEach((k) => {
        if (!grouped[k]) grouped[k] = [];
        if (!grouped[k].some((m) => m.id === msg.id)) {
          grouped[k].push(msg);
        }
      });
    });

    return grouped;
  } catch (err) {
    console.warn('Error fetching messages from Supabase:', err);
    return null;
  }
};

export const dbSendMessage = async (message: ChatMessage, classroomId: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const payload: Record<string, unknown> = {
      id: message.id,
      classroom_id: classroomId,
      sender_id: message.senderId,
      sender_name: message.senderName,
      sender_roll_no: message.senderRollNo || null,
      sender_avatar: message.senderAvatar || null,
      content: message.content,
      timestamp: message.timestamp,
      channel_id: message.channelId || null,
      recipient_id: message.recipientId || null,
      is_encrypted: message.isEncrypted,
      auto_delete: message.autoDelete,
      expires_at: message.expiresAt || null,
      image_url: message.imageUrl || null,
      document: message.document || null,
      reactions: message.reactions || [],
      reply_to: message.replyTo || null,
    };

    let { error } = await supabase.from('messages').insert(payload);

    // Fallback if reply_to column is missing on existing Supabase schema
    if (error && (error.message?.includes('reply_to') || error.details?.includes('reply_to'))) {
      delete payload.reply_to;
      const retry = await supabase.from('messages').insert(payload);
      error = retry.error;
    }

    return !error;
  } catch (err) {
    console.warn('Error saving message in Supabase:', err);
    return false;
  }
};

export const dbUpdateMessageReactions = async (
  messageId: string,
  reactions: MessageReaction[],
  classroomId?: string
): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    let query = supabase.from('messages').update({ reactions }).eq('id', messageId);
    if (classroomId) {
      query = query.eq('classroom_id', classroomId);
    }
    const { error } = await query;
    return !error;
  } catch (err) {
    console.warn('Error updating message reactions in Supabase:', err);
    return false;
  }
};

export const dbDeleteMessage = async (messageId: string, classroomId?: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    let query = supabase.from('messages').delete().eq('id', messageId);
    if (classroomId) {
      query = query.eq('classroom_id', classroomId);
    }
    const { error } = await query;
    return !error;
  } catch (err) {
    console.warn('Error deleting message from Supabase:', err);
    return false;
  }
};

export const dbClearConversationMessages = async (
  classroomId: string,
  channelId?: string,
  dmRecipientId?: string,
  dmSenderId?: string
): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    let query = supabase.from('messages').delete().eq('classroom_id', classroomId);
    if (channelId) {
      query = query.eq('channel_id', channelId);
    } else if (dmRecipientId && dmSenderId) {
      query = query.or(
        `and(sender_id.eq.${dmSenderId},recipient_id.eq.${dmRecipientId}),and(sender_id.eq.${dmRecipientId},recipient_id.eq.${dmSenderId})`
      );
    }
    const { error } = await query;
    return !error;
  } catch (err) {
    console.warn('Error clearing conversation messages in Supabase:', err);
    return false;
  }
};

export const dbPruneExpiredMessages = async (classroomId: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('classroom_id', classroomId)
      .not('expires_at', 'is', null)
      .lte('expires_at', new Date().toISOString());
    return !error;
  } catch (err) {
    console.warn('Error pruning expired messages in Supabase:', err);
    return false;
  }
};
