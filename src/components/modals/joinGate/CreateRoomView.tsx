import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { CreatorIdentitySection } from './CreatorIdentitySection';
import { ClassroomConfigSection } from './ClassroomConfigSection';

interface CreateRoomViewProps {
  creatorType: 'teacher' | 'student';
  setCreatorType: (v: 'teacher' | 'student') => void;
  creatorDesignation: string;
  setCreatorDesignation: (v: string) => void;
  newAdminRollNo: string;
  setNewAdminRollNo: (v: string) => void;
  newAdminName: string;
  setNewAdminName: (v: string) => void;
  newAdminPhone: string;
  setNewAdminPhone: (v: string) => void;
  newAdminEmail: string;
  setNewAdminEmail: (v: string) => void;
  newAdminPassword: string;
  setNewAdminPassword: (v: string) => void;
  newRoomName: string;
  setNewRoomName: (v: string) => void;
  newRoomSection: string;
  setNewRoomSection: (v: string) => void;
  newRoomSemester: string;
  setNewRoomSemester: (v: string) => void;
  newRoomInstitution: string;
  setNewRoomInstitution: (v: string) => void;
  newRoomCode: string;
  setNewRoomCode: (v: string) => void;
  isAdminEmailVerified: boolean;
  isAdminSendingOtp: boolean;
  adminOtpSent: boolean;
  adminOtpCountdown: number;
  adminOtpInput: string;
  isAdminVerifyingOtp: boolean;
  adminOtpError?: string;
  setAdminOtpInput: (v: string) => void;
  onSendAdminOtp: () => void;
  onVerifyAdminOtp: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CreateRoomView: React.FC<CreateRoomViewProps> = (props) => {
  return (
    <form onSubmit={props.onSubmit} autoComplete="off" className="space-y-4 animate-in fade-in">
      {/* Public Transparency Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 space-y-1 text-left transition-colors">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
          <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          Public Room Creator Transparency
        </div>
        <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
          As the classroom creator and Class Representative (CR), your <strong>Full Name</strong>, <strong>Mobile / WhatsApp</strong>, and <strong>Email</strong> will be <strong>publicly visible</strong> to prospective students on the room gate so they can verify and reach you.
        </p>
      </div>

      {/* Section 1: Creator Identity & Personal Details */}
      <CreatorIdentitySection
        creatorType={props.creatorType}
        setCreatorType={props.setCreatorType}
        creatorDesignation={props.creatorDesignation}
        setCreatorDesignation={props.setCreatorDesignation}
        newAdminRollNo={props.newAdminRollNo}
        setNewAdminRollNo={props.setNewAdminRollNo}
        newAdminName={props.newAdminName}
        setNewAdminName={props.setNewAdminName}
        newAdminPhone={props.newAdminPhone}
        setNewAdminPhone={props.setNewAdminPhone}
        newAdminEmail={props.newAdminEmail}
        setNewAdminEmail={props.setNewAdminEmail}
        newAdminPassword={props.newAdminPassword}
        setNewAdminPassword={props.setNewAdminPassword}
        isAdminEmailVerified={props.isAdminEmailVerified}
        isAdminSendingOtp={props.isAdminSendingOtp}
        adminOtpSent={props.adminOtpSent}
        adminOtpCountdown={props.adminOtpCountdown}
        adminOtpInput={props.adminOtpInput}
        isAdminVerifyingOtp={props.isAdminVerifyingOtp}
        adminOtpError={props.adminOtpError}
        setAdminOtpInput={props.setAdminOtpInput}
        onSendAdminOtp={props.onSendAdminOtp}
        onVerifyAdminOtp={props.onVerifyAdminOtp}
      />

      {/* Section 2: Classroom Configuration */}
      <ClassroomConfigSection
        newRoomName={props.newRoomName}
        setNewRoomName={props.setNewRoomName}
        newRoomSection={props.newRoomSection}
        setNewRoomSection={props.setNewRoomSection}
        newRoomSemester={props.newRoomSemester}
        setNewRoomSemester={props.setNewRoomSemester}
        newRoomInstitution={props.newRoomInstitution}
        setNewRoomInstitution={props.setNewRoomInstitution}
        newRoomCode={props.newRoomCode}
        setNewRoomCode={props.setNewRoomCode}
      />

      {/* Submit button */}
      <button
        type="submit"
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-950/30 transition flex items-center justify-center gap-2 mt-4 active:scale-[0.99] cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        <span>Launch Classroom & Enter Dashboard</span>
      </button>
    </form>
  );
};
