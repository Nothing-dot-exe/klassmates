export interface SendApprovalEmailParams {
  to: string;
  name: string;
  rollNo: string;
  email: string;
  password?: string;
  classroomName: string;
  classroomCode: string;
  adminName?: string;
}

/**
 * Calls the /api/send-approval-email endpoint to dispatch credentials to the student.
 */
export async function apiSendApprovalEmail(params: SendApprovalEmailParams): Promise<boolean> {
  if (!params.to || !params.to.includes('@')) return false;

  try {
    const res = await fetch('/api/send-approval-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('Failed to send approval email via API:', err);
    return false;
  }
}
