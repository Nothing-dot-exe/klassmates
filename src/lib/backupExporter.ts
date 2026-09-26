import { Classroom, User, ChatMessage, DocumentItem, PendingRequest, PasswordResetRequest } from '@/types';

export function exportAndDownloadRoomBackup(
  classroom: Classroom,
  students: User[],
  messages: Record<string, ChatMessage[]>,
  documents: DocumentItem[],
  pendingRequests: PendingRequest[],
  passwordResetRequests: PasswordResetRequest[]
) {
  const sanitizedClassroom = { ...classroom, adminPassword: '' };
  const sanitizedRoster = students.map((s) => ({ ...s, password: '' }));
  const sanitizedPendingRequests = pendingRequests.map((r) => ({ ...r, password: '' }));

  const backupArchive = {
    exportTimestamp: new Date().toISOString(),
    classroomInfo: sanitizedClassroom,
    roster: sanitizedRoster,
    chatHistory: messages,
    documentsCatalog: documents,
    pendingJoinRequests: sanitizedPendingRequests,
    passwordResetRequests: passwordResetRequests,
  };

  const jsonString = JSON.stringify(backupArchive, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = `Classmate-Backup-${classroom.code}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
}
