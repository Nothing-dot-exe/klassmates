import React from 'react';
import { KeyRound, CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import { PendingRequest, PasswordResetRequest } from '@/types';
import { DEFAULT_TEMP_PASSWORD } from '@/lib/privacyUtils';

interface PendingRequestsTabProps {
  pendingRequests: PendingRequest[];
  passwordResetRequests: PasswordResetRequest[];
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onApproveAllRequests: () => void;
  onApprovePasswordReset?: (requestId: string, studentId: string) => void;
  onRejectPasswordReset?: (requestId: string) => void;
  showToast: (msg: string) => void;
}

export const PendingRequestsTab: React.FC<PendingRequestsTabProps> = ({
  pendingRequests,
  passwordResetRequests,
  onApproveRequest,
  onRejectRequest,
  onApproveAllRequests,
  onApprovePasswordReset,
  onRejectPasswordReset,
  showToast,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. PASSWORD RESET REQUESTS (HR / ADMIN WORKFLOW) */}
      <div className="bg-white dark:bg-[#0E1424] border border-zinc-200 dark:border-[#1F2A44] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-[#1F2A44]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-[#121A2D] text-zinc-900 dark:text-amber-400 border border-zinc-200 dark:border-[#1F2A44]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-950 dark:text-white flex items-center gap-2">
                Password Reset Requests
                {passwordResetRequests.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                    {passwordResetRequests.length} Pending
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                Students who forgot their password and submitted an HR-style password reset request.
              </p>
            </div>
          </div>
        </div>

        {passwordResetRequests.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-[#1F2A44] rounded-2xl space-y-2 bg-zinc-50/50 dark:bg-[#080C15]/40">
            <div className="p-2 bg-zinc-100 dark:bg-[#121A2D] text-zinc-900 dark:text-emerald-400 rounded-xl inline-block border border-zinc-200 dark:border-[#1F2A44]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">No Password Reset Requests</p>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto font-medium">
              When a student requests a password reset from the sign-in screen, their request will appear here for your
              approval.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {passwordResetRequests.map((pwReq) => (
              <div
                key={pwReq.id}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-indigo-500/40 transition shadow-xs"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-zinc-950 dark:text-white truncate max-w-[150px] sm:max-w-none">
                      {pwReq.studentName}
                    </span>
                    <span
                      className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#161F36] px-2 py-0.5 rounded border border-zinc-200 dark:border-[#1F2A44] truncate max-w-[160px] sm:max-w-none flex-shrink-0"
                      title={pwReq.rollNo}
                    >
                      Roll No: {pwReq.rollNo}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-2 flex-wrap">
                    <span className="truncate max-w-[160px] sm:max-w-none">{pwReq.email || 'No email'}</span>
                    {pwReq.phone && <span>• {pwReq.phone}</span>}
                    <span>• Requested {pwReq.requestedAt}</span>
                  </p>
                  {pwReq.note && (
                    <p className="text-[11px] text-zinc-700 dark:text-zinc-300 italic font-medium">&quot;{pwReq.note}&quot;</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (onRejectPasswordReset) onRejectPasswordReset(pwReq.id);
                      showToast(`Declined reset request for ${pwReq.studentName}`);
                    }}
                    className="flex-1 sm:flex-initial justify-center px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-[#1F2A44] bg-white dark:bg-[#161F36] text-zinc-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </button>

                  <button
                    onClick={() => {
                      if (onApprovePasswordReset) {
                        onApprovePasswordReset(pwReq.id, pwReq.studentId);
                      }
                      navigator.clipboard.writeText(DEFAULT_TEMP_PASSWORD);
                      showToast(`Approved! Password reset to ${DEFAULT_TEMP_PASSWORD} (Copied!)`);
                    }}
                    className="flex-1 sm:flex-initial justify-center px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-950/20 transition active:scale-95 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 flex-shrink-0" />
                    Reset to Default ({DEFAULT_TEMP_PASSWORD})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. OUTSIDE STUDENT ACCESS REQUESTS */}
      <div className="bg-white dark:bg-[#0E1424] border border-zinc-200 dark:border-[#1F2A44] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-[#1F2A44]">
          <div>
            <h3 className="text-sm font-black text-zinc-950 dark:text-white">Pending Outside Join Requests</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              Students outside who entered the Class Code with their Roll Number and are waiting for your approval.
            </p>
          </div>

          {pendingRequests.length > 0 && (
            <button
              onClick={() => {
                onApproveAllRequests();
                showToast(`Approved all ${pendingRequests.length} students!`);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-950/20 transition self-start sm:self-auto cursor-pointer active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              Approve All ({pendingRequests.length})
            </button>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-[#1F2A44] rounded-2xl space-y-3 bg-zinc-50/50 dark:bg-[#080C15]/40">
            <div className="p-3 bg-zinc-100 dark:bg-[#121A2D] text-zinc-900 dark:text-emerald-400 rounded-2xl inline-block border border-zinc-200 dark:border-[#1F2A44]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-zinc-950 dark:text-white">No Pending Requests</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto font-medium">
              All outside student join requests have been processed. New requests will appear here instantly when
              students use your class code.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-indigo-500/40 transition shadow-xs"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-zinc-950 dark:text-white truncate max-w-[150px] sm:max-w-none">
                      {req.name}
                    </span>
                    <span
                      className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#161F36] px-2 py-0.5 rounded border border-zinc-200 dark:border-[#1F2A44] truncate max-w-[160px] sm:max-w-none flex-shrink-0"
                      title={req.rollNo}
                    >
                      Roll No: {req.rollNo}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-2 flex-wrap">
                    <span className="truncate max-w-[160px] sm:max-w-none">{req.email}</span>
                    {req.phone && <span>• {req.phone}</span>}
                    <span>• Requested {req.requestedAt}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                  <button
                    onClick={() => {
                      onRejectRequest(req.id);
                      showToast(`Declined request from ${req.name}`);
                    }}
                    className="flex-1 sm:flex-initial justify-center px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-[#1F2A44] bg-white dark:bg-[#161F36] text-zinc-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </button>

                  <button
                    onClick={() => {
                      onApproveRequest(req.id);
                      showToast(`Approved ${req.name} into classroom!`);
                    }}
                    className="flex-1 sm:flex-initial justify-center px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950/20 transition active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Entry
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
