import React, { useState } from 'react';
import { ShieldCheck, Clock, LogOut, Sparkles, Trash2, UserMinus, AlertTriangle, Crown } from 'lucide-react';
import { User, AutoDeleteOption } from '@/types';

interface ProfileSettingsSectionProps {
  currentUser: User;
  students?: User[];
  currentAutoDelete: AutoDeleteOption;
  onUpdateCurrentUser: (updated: Partial<User>) => void;
  onUpdateAutoDelete?: (val: AutoDeleteOption) => void;
  onClearAllChat?: () => void;
  onSignOut?: () => void;
  onLeaveClassroom?: (successorId?: string) => Promise<boolean | void> | void;
}

export const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = ({
  currentUser,
  students = [],
  currentAutoDelete,
  onUpdateCurrentUser,
  onUpdateAutoDelete,
  onClearAllChat,
  onSignOut,
  onLeaveClassroom,
}) => {
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [selectedSuccessorId, setSelectedSuccessorId] = useState<string>('');

  const isAdmin = currentUser.role === 'admin';

  const otherStudents = students.filter((s) => s.id !== currentUser.id);

  const handleConfirmLeaveClassroom = async () => {
    if (!onLeaveClassroom) return;
    if (isAdmin && otherStudents.length > 0 && !selectedSuccessorId) {
      return; // Cannot exit without choosing a successor
    }
    setIsLeaving(true);
    try {
      await onLeaveClassroom(selectedSuccessorId || undefined);
    } catch (e) {
      console.error('Error leaving classroom:', e);
      setIsLeaving(false);
    }
  };

  return (
    <div className="space-y-3.5 pt-2 border-t border-zinc-200">
      <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
        Chat & Account Settings
      </div>

      {/* AES-256 E2EE Active Shield */}
      <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center gap-2.5">
        <ShieldCheck className="w-5 h-5 text-zinc-900 flex-shrink-0" />
        <div>
          <div className="text-xs font-bold text-zinc-950">AES-256 End-to-End Encryption</div>
          <div className="text-[10px] text-zinc-500">
            Messages & study notes are encrypted client-side before transmission.
          </div>
        </div>
      </div>

      {/* Auto-Delete (Disappearing Messages) Setting */}
      <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
            <Clock className="w-3.5 h-3.5 text-zinc-700" />
            <span>Disappearing Messages</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-300">
            {currentAutoDelete === 'off' ? 'Off (Permanent)' : currentAutoDelete}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {(['off', '24h', '7d'] as AutoDeleteOption[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onUpdateAutoDelete && onUpdateAutoDelete(opt)}
              className={`py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                currentAutoDelete === opt
                  ? 'bg-zinc-950 text-white border-zinc-950 shadow-2xs'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              {opt === 'off' ? 'Permanent' : opt === '24h' ? '24 Hours' : '7 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Chat History Button */}
      {onClearAllChat && (
        <button
          type="button"
          onClick={onClearAllChat}
          className="w-full py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-rose-600 border border-zinc-200 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-zinc-500" />
          <span>Clear Chat History (with Backup)</span>
        </button>
      )}

      {/* Sign Out Button */}
      {onSignOut && (
        <button
          type="button"
          onClick={onSignOut}
          className="w-full py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border border-zinc-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-zinc-500" />
          <span>Sign Out / Switch Account</span>
        </button>
      )}

      {/* Voluntary Exit / Leave Classroom Card */}
      {onLeaveClassroom && (
        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
              <UserMinus className="w-4 h-4 text-zinc-700" />
              <span>Leave Classroom</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-800 border border-zinc-300">
              {isAdmin ? 'Admin Transfer' : 'Student Exit'}
            </span>
          </div>

          <p className="text-[11px] text-zinc-600 leading-relaxed">
            {isAdmin
              ? 'As the Class Representative, you must appoint a successor to take over admin responsibilities before leaving.'
              : 'Want to leave this class? Your account will be removed from the class roster, a departure farewell will be announced in #general, and you will be signed out.'}
          </p>

          {confirmLeave ? (
            <div className="p-3 rounded-xl bg-white border border-zinc-300 space-y-3 shadow-sm animate-in fade-in">
              {isAdmin && otherStudents.length > 0 ? (
                <>
                  <div className="flex items-start gap-2 text-zinc-950 text-xs font-semibold">
                    <Crown className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Appoint Next Class Representative & Admin</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    Select the classmate who will take over leadership and become the new Classroom Admin:
                  </p>

                  <div className="space-y-1.5">
                    <select
                      value={selectedSuccessorId}
                      onChange={(e) => setSelectedSuccessorId(e.target.value)}
                      className="w-full py-2 px-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 cursor-pointer"
                    >
                      <option value="">-- Select next Admin from class --</option>
                      {otherStudents.map((cand) => (
                        <option key={cand.id} value={cand.id}>
                          {cand.name} ({cand.rollNo}) — {cand.designation || 'Classmate'}
                        </option>
                      ))}
                    </select>
                    {!selectedSuccessorId && (
                      <p className="text-[10px] text-amber-600 flex items-center gap-1 pt-0.5">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        Please choose a successor to exit. If no one is selected, you cannot leave.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isLeaving}
                      onClick={() => {
                        setConfirmLeave(false);
                        setSelectedSuccessorId('');
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition cursor-pointer border border-zinc-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isLeaving || !selectedSuccessorId}
                      onClick={handleConfirmLeaveClassroom}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-2xs ${
                        !selectedSuccessorId
                          ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                          : 'bg-zinc-950 hover:bg-zinc-800 text-white cursor-pointer active:scale-98'
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5 text-white" />
                      <span>{isLeaving ? 'Transferring...' : 'Transfer Admin & Leave'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2 text-zinc-950 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 text-zinc-700 flex-shrink-0 mt-0.5" />
                    <span>Are you sure you want to permanently leave this classroom?</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isLeaving}
                      onClick={() => setConfirmLeave(false)}
                      className="flex-1 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition cursor-pointer border border-zinc-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isLeaving}
                      onClick={handleConfirmLeaveClassroom}
                      className="flex-1 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-2xs transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      <span>{isLeaving ? 'Leaving...' : 'Yes, Leave Class'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmLeave(true)}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <UserMinus className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Leave Classroom (Appoint Successor)' : 'Leave Classroom & Delete Account'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
