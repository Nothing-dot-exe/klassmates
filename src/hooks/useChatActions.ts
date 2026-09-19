import React from 'react';
import { User, DocumentItem, ChatMessage, AutoDeleteOption, ChatReplyReference } from '@/types';
import { CURRENT_USER } from '@/lib/mockData';
import { dbSendMessage, dbCreateDocument, dbDeleteDocument, dbDeleteMessage, dbClearConversationMessages, dbUpdateMessageReactions } from '@/lib/databaseService';
import { broadcastNewMessage, broadcastReaction, broadcastMessageDeleted, broadcastClearChat } from '@/lib/realtimeService';
import { generateUniqueId } from '@/lib/security/idUtils';

interface UseChatActionsParams {
  classroomId: string;
  currentUser: User | null;
  currentConversationKey: string;
  selectedChannelId: string;
  selectedDmUserId: string;
  activeView: string;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
}

export function useChatActions({
  classroomId,
  currentUser,
  currentConversationKey,
  selectedChannelId,
  selectedDmUserId,
  activeView,
  setMessages,
  setDocuments,
}: UseChatActionsParams) {
  const handleAddDocument = (doc: DocumentItem) => {
    setDocuments((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);
    dbCreateDocument(doc, classroomId);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    dbDeleteDocument(docId, classroomId);
  };

  const handleSendMessage = (payload: {
    content: string;
    autoDelete: AutoDeleteOption;
    imageUrl?: string;
    videoUrl?: string;
    document?: DocumentItem;
    replyTo?: ChatReplyReference;
  }) => {
    const sender = currentUser || CURRENT_USER;
    const newMessage: ChatMessage = {
      id: generateUniqueId('msg'),
      senderId: sender.id,
      senderName: sender.nickname?.trim() || sender.name,
      senderRollNo: sender.rollNo,
      senderAvatar: sender.avatar,
      content: payload.content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channelId: activeView === 'channel' ? selectedChannelId : undefined,
      recipientId: activeView === 'dm' ? selectedDmUserId : undefined,
      isEncrypted: true,
      autoDelete: payload.autoDelete,
      expiresAt:
        payload.autoDelete === '24h'
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          : payload.autoDelete === '7d'
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      imageUrl: payload.imageUrl,
      videoUrl: payload.videoUrl,
      document: payload.document,
      reactions: [],
      replyTo: payload.replyTo,
    };

    setMessages((prev) => {
      const updated = { ...prev };
      const targetKeys = [currentConversationKey];
      if (!newMessage.channelId) {
        if (newMessage.recipientId) targetKeys.push(`dm_${newMessage.recipientId}`);
        if (newMessage.senderId) targetKeys.push(`dm_${newMessage.senderId}`);
      }
      targetKeys.forEach((k) => {
        const list = updated[k] || [];
        if (!list.some((m) => m.id === newMessage.id)) {
          updated[k] = [...list, newMessage];
        }
      });
      return updated;
    });

    // Instant WebSocket broadcast (< 50ms) to other active clients
    broadcastNewMessage(newMessage, classroomId);

    // Asynchronous database write for permanent persistence
    dbSendMessage(newMessage, classroomId);

    if (payload.document) {
      handleAddDocument(payload.document);
    }
  };

  const handleReact = (messageId: string, emoji: string) => {
    const currentUserId = currentUser ? currentUser.id : CURRENT_USER.id;

    setMessages((prev) => {
      const chatList = prev[currentConversationKey] || [];
      const updated = chatList.map((msg) => {
        if (msg.id !== messageId) return msg;
        const existingReaction = msg.reactions.find((r) => r.emoji === emoji);

        let newReactions;
        if (existingReaction) {
          const hasReacted = existingReaction.users.includes(currentUserId);
          newReactions = msg.reactions
            .map((r) => {
              if (r.emoji !== emoji) return r;
              return {
                ...r,
                count: hasReacted ? r.count - 1 : r.count + 1,
                users: hasReacted
                  ? r.users.filter((u) => u !== currentUserId)
                  : [...r.users, currentUserId],
              };
            })
            .filter((r) => r.count > 0);
        } else {
          newReactions = [...msg.reactions, { emoji, count: 1, users: [currentUserId] }];
        }

        // Persist to database & broadcast live WebSocket event
        dbUpdateMessageReactions(messageId, newReactions, classroomId);
        broadcastReaction(messageId, newReactions, classroomId);

        return { ...msg, reactions: newReactions };
      });

      return {
        ...prev,
        [currentConversationKey]: updated,
      };
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => {
      const updated: Record<string, ChatMessage[]> = {};
      Object.entries(prev).forEach(([key, list]) => {
        updated[key] = list.filter((m) => m.id !== messageId);
      });
      return updated;
    });

    broadcastMessageDeleted(messageId, classroomId);
    dbDeleteMessage(messageId, classroomId);
  };

  const handleDeleteForMe = (messageId: string) => {
    setMessages((prev) => {
      const chatList = prev[currentConversationKey] || [];
      return {
        ...prev,
        [currentConversationKey]: chatList.filter((m) => m.id !== messageId),
      };
    });
  };

  const handleClearChat = () => {
    setMessages((prev) => ({
      ...prev,
      [currentConversationKey]: [],
    }));

    broadcastClearChat(currentConversationKey, classroomId);

    const chId = activeView === 'channel' ? selectedChannelId : undefined;
    const dmRecipientId = activeView === 'dm' ? selectedDmUserId : undefined;
    const dmSenderId = currentUser?.id || CURRENT_USER.id;

    dbClearConversationMessages(classroomId, chId, dmRecipientId, dmSenderId);
  };

  return {
    handleSendMessage,
    handleAddDocument,
    handleDeleteDocument,
    handleReact,
    handleDeleteMessage,
    handleDeleteForMe,
    handleClearChat,
  };
}
