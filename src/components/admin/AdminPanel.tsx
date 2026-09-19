'use client';

import React, { useState, useMemo, useEffect } from 'react';
import QRCode from 'qrcode';
import { Sparkles } from 'lucide-react';
import { User, UserRole } from '@/types';
import { DEFAULT_TEMP_PASSWORD } from '@/lib/privacyUtils';
import { verifyPassword } from '@/lib/security/passwordUtils';
import { generateInviteCardPng } from '@/lib/cardGenerator';
import { exportAndDownloadRoomBackup } from '@/lib/backupExporter';
import { AdminPanelProps } from './adminTypes';
import { AdminHeader, AdminTab } from './AdminHeader';
import { RosterTab } from './RosterTab';
import { PendingRequestsTab } from './PendingRequestsTab';
import { AddStudentsTab } from './AddStudentsTab';
import { RoomSettingsTab } from './RoomSettingsTab';
import { ShareRoomTab } from './ShareRoomTab';
import { EditStudentModal } from './EditStudentModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { FactoryResetModal } from './FactoryResetModal';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  classroom, students, pendingRequests, passwordResetRequests = [], messages = {}, documents = [],
  onAddStudent, onBulkAddStudents, onRemoveStudent, onUpdateStudent,
  onApproveRequest, onApproveAllRequests, onRejectRequest, onUpdateClassroom,
  onApprovePasswordReset, onRejectPasswordReset, onAdminResetPassword, onResetRoomData,
  onDeleteDocument, onBack,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('roster');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [joinUrl, setJoinUrl] = useState<string>('');
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [resetModalStudent, setResetModalStudent] = useState<User | null>(null);

  const totalMessagesCount = useMemo(() => {
    return Object.values(messages).reduce((acc, msgs) => acc + (msgs?.length || 0), 0);
  }, [messages]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const url = `${origin}/?code=${encodeURIComponent(classroom.code)}`;
      setJoinUrl(url);

      QRCode.toDataURL(url, {
        width: 320,
        margin: 1.5,
        color: { dark: '#09090b', light: '#ffffff' },
      })
        .then((data) => setQrDataUrl(data))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [classroom.code]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classroom.code);
    setCopiedCode(true);
    showToast('Class code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    showToast('Direct invitation link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${classroom.name} on Classmate`,
          text: `Join our classroom on Classmate! Class Code: ${classroom.code}\nLink: ${joinUrl}`,
          url: joinUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadCard = async () => {
    setIsGeneratingDownload(true);
    try {
      const pngUrl = await generateInviteCardPng(classroom, joinUrl, qrDataUrl);
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `Classmate-${classroom.code}-InviteCard.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      showToast('Downloaded high-resolution Classroom Invite Card!');
    } catch (err) {
      console.error('Error generating card image:', err);
      showToast('Failed to generate card image.');
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  const handleExtractAndReset = async () => {
    if (classroom.adminPassword) {
      const check = await verifyPassword(adminPasswordConfirm.trim(), classroom.adminPassword);
      if (!check.isValid) {
        showToast('Access Denied: Incorrect Master Admin Password.');
        return;
      }
    }

    if (resetConfirmText.trim().toUpperCase() !== 'RESET') {
      showToast('Please type RESET to confirm.');
      return;
    }
    setIsResetting(true);
    try {
      exportAndDownloadRoomBackup(
        classroom,
        students,
        messages,
        documents,
        pendingRequests,
        passwordResetRequests
      );

      // Allow browser download to initiate cleanly
      await new Promise((r) => setTimeout(r, 600));

      if (onResetRoomData) {
        await onResetRoomData();
      }

      setIsResetConfirmOpen(false);
      setResetConfirmText('');
      setAdminPasswordConfirm('');

      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/?fresh=true';
      }
    } catch (err) {
      console.error('Error resetting room:', err);
      showToast('Failed to reset room.');
      setIsResetting(false);
    }
  };

  const handleToggleRole = (student: User) => {
    if (student.id === (classroom.adminId || 'usr_admin')) {
      showToast('Cannot change role of primary classroom administrator.');
      return;
    }
    const newRoleValue: UserRole = student.role === 'admin' ? 'student' : 'admin';
    onUpdateStudent(student.id, { role: newRoleValue });
    showToast(`Changed role of ${student.name} to ${newRoleValue === 'admin' ? 'Class Representative (CR)' : 'Student'}`);
  };

  const handleConfirmResetPassword = (student: User) => {
    if (onAdminResetPassword) {
      onAdminResetPassword(student.id, DEFAULT_TEMP_PASSWORD);
    } else {
      onUpdateStudent(student.id, {
        password: DEFAULT_TEMP_PASSWORD,
        mustChangePassword: true,
      });
    }
    showToast(`Password for ${student.name} reset to ${DEFAULT_TEMP_PASSWORD}`);
    setResetModalStudent(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100/70 dark:bg-[#09090b] overflow-y-auto no-scrollbar relative transition-colors">
      {toastMessage && (
        <div className="fixed bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 max-w-sm sm:max-w-md bg-slate-900 dark:bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-glow-purple border border-slate-800 dark:border-indigo-500/50 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="w-4 h-4 text-white flex-shrink-0" />
          <span className="truncate sm:whitespace-normal">{toastMessage}</span>
        </div>
      )}

      <AdminHeader
        classroom={classroom}
        students={students}
        pendingRequests={pendingRequests}
        passwordResetRequests={passwordResetRequests}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        copiedCode={copiedCode}
        onCopyCode={handleCopyCode}
        onBack={onBack}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {activeTab === 'roster' && (
          <RosterTab
            classroom={classroom}
            students={students}
            onOpenAddTab={() => setActiveTab('add')}
            onOpenEdit={(s) => setEditingStudent(s)}
            onOpenResetPassword={(s) => setResetModalStudent(s)}
            onRemoveStudent={onRemoveStudent}
            onToggleRole={handleToggleRole}
            showToast={showToast}
          />
        )}

        {activeTab === 'pending' && (
          <PendingRequestsTab
            pendingRequests={pendingRequests}
            passwordResetRequests={passwordResetRequests}
            onApproveRequest={onApproveRequest}
            onRejectRequest={onRejectRequest}
            onApproveAllRequests={onApproveAllRequests}
            onApprovePasswordReset={onApprovePasswordReset}
            onRejectPasswordReset={onRejectPasswordReset}
            showToast={showToast}
          />
        )}

        {activeTab === 'add' && (
          <AddStudentsTab
            students={students}
            onAddStudent={onAddStudent}
            onBulkAddStudents={onBulkAddStudents}
            showToast={showToast}
          />
        )}

        {activeTab === 'settings' && (
          <RoomSettingsTab
            classroom={classroom}
            students={students}
            documents={documents}
            pendingRequests={pendingRequests}
            passwordResetRequests={passwordResetRequests}
            totalMessagesCount={totalMessagesCount}
            onUpdateClassroom={onUpdateClassroom}
            onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
            onDeleteDocument={onDeleteDocument}
            showToast={showToast}
          />
        )}

        {activeTab === 'share' && (
          <ShareRoomTab
            classroom={classroom}
            qrDataUrl={qrDataUrl}
            joinUrl={joinUrl}
            copiedLink={copiedLink}
            isGeneratingDownload={isGeneratingDownload}
            onCopyLink={handleCopyLink}
            onDownloadCard={handleDownloadCard}
            onNativeShare={handleNativeShare}
          />
        )}
      </div>

      <EditStudentModal
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
        onSave={(id: string, updated: Partial<User>) => {
          onUpdateStudent(id, updated);
          showToast('Updated student details successfully!');
        }}
      />

      <ResetPasswordModal
        student={resetModalStudent}
        onClose={() => setResetModalStudent(null)}
        onConfirm={handleConfirmResetPassword}
      />

      <FactoryResetModal
        isOpen={isResetConfirmOpen}
        classroom={classroom}
        resetConfirmText={resetConfirmText}
        setResetConfirmText={setResetConfirmText}
        adminPasswordConfirm={adminPasswordConfirm}
        setAdminPasswordConfirm={setAdminPasswordConfirm}
        isResetting={isResetting}
        onClose={() => {
          setIsResetConfirmOpen(false);
          setAdminPasswordConfirm('');
        }}
        onConfirmReset={handleExtractAndReset}
      />
    </div>
  );
};
