/**
 * CHAT DELETION & MODERATION PERMISSIONS MATRIX
 * Strict role and context-based authorization for message deletion.
 */

export interface CanDeleteForEveryoneParams {
  isChannel: boolean;
  currentUser: {
    id: string;
    role?: string;
    rollNo?: string;
    name?: string;
  };
  targetMessage: {
    senderId: string;
    senderRollNo?: string;
    senderName?: string;
  };
  adminUser?: {
    id: string;
  };
}

/**
 * Determines whether the user has permission to execute "Delete for Everyone" on a message.
 *
 * Rules:
 * 1. In 1-on-1 Direct Messages (DMs):
 *    - ONLY the original message author can delete for everyone.
 *    - The recipient (even if Class Rep / Admin) can NEVER delete someone else's DM for everyone (only "Delete for Me").
 *
 * 2. In Public Group Channels (#general):
 *    - The original author can delete for everyone.
 *    - The Class Rep / Admin can delete for everyone (for classroom moderation).
 *    - Other classmates can ONLY delete for me.
 */
export function evaluateCanDeleteForEveryone(params: CanDeleteForEveryoneParams): boolean {
  if (!params.currentUser || !params.targetMessage) return false;

  const isAuthor = Boolean(
    params.targetMessage.senderId === params.currentUser.id ||
    (Boolean(params.targetMessage.senderRollNo) &&
      Boolean(params.currentUser.rollNo) &&
      params.targetMessage.senderRollNo?.toLowerCase() === params.currentUser.rollNo?.toLowerCase()) ||
    (Boolean(params.targetMessage.senderName) &&
      Boolean(params.currentUser.name) &&
      params.targetMessage.senderName?.toLowerCase() === params.currentUser.name?.toLowerCase())
  );

  const isAdmin = Boolean(
    params.currentUser.role === 'admin' ||
    (params.adminUser && params.currentUser.id === params.adminUser.id)
  );

  // In channels: Author or Admin/CR can delete for everyone.
  // In private DMs: ONLY the message author can delete for everyone.
  return params.isChannel ? (isAuthor || isAdmin) : isAuthor;
}
