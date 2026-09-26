'use client';

import React from 'react';
import { ChatMessage, DocumentItem, UserRole } from '@/types';
import { ChannelMessageRow } from './ChannelMessageRow';
import { DirectMessageRow } from './DirectMessageRow';

export interface MessageItemProps {
  message: ChatMessage;
  currentUserId: string;
  currentUserRole?: UserRole;
  isHighlighted?: boolean;
  /** First message in a consecutive group from the same sender */
  isFirst?: boolean;
  /** Last message in a consecutive group from the same sender */
  isLast?: boolean;
  /** Distinct styling between General Classroom chat vs 1-on-1 DM */
  chatMode?: 'channel' | 'dm';
  onOpenDocument: (doc: DocumentItem) => void;
  onReact: (messageId: string, emoji: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onRequestDelete?: (message: ChatMessage) => void;
  onOpenProfile?: (userId: string) => void;
  onReply?: (message: ChatMessage) => void;
  onScrollToMessage?: (messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  currentUserRole,
  isHighlighted,
  isFirst = true,
  isLast = true,
  chatMode = 'channel',
  onOpenDocument,
  onReact,
  onDeleteMessage,
  onRequestDelete,
  onOpenProfile,
  onReply,
  onScrollToMessage,
}) => {
  if (chatMode === 'channel') {
    return (
      <ChannelMessageRow
        message={message}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        isHighlighted={isHighlighted}
        isFirst={isFirst}
        isLast={isLast}
        onOpenDocument={onOpenDocument}
        onReact={onReact}
        onDeleteMessage={onDeleteMessage}
        onRequestDelete={onRequestDelete}
        onOpenProfile={onOpenProfile}
        onReply={onReply}
        onScrollToMessage={onScrollToMessage}
      />
    );
  }

  return (
    <DirectMessageRow
      message={message}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
      isHighlighted={isHighlighted}
      isFirst={isFirst}
      isLast={isLast}
      onOpenDocument={onOpenDocument}
      onReact={onReact}
      onDeleteMessage={onDeleteMessage}
      onRequestDelete={onRequestDelete}
      onOpenProfile={onOpenProfile}
      onReply={onReply}
      onScrollToMessage={onScrollToMessage}
    />
  );
};
