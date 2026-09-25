'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, FileText, ShieldCheck, User as UserIcon } from 'lucide-react';
import { DocumentItem, User } from '@/types';
import { CURRENT_USER } from '@/lib/mockData';
import { getDmConversationKey } from '@/lib/chatUtils';
import { dbCreatePendingRequest, dbCreateStudent, dbUpdateClassroom } from '@/lib/databaseService';
import { useClassroomData } from '@/hooks/useClassroomData';
import { useUserSession } from '@/hooks/useUserSession';
import { useClassroomActions } from '@/hooks/useClassroomActions';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { DocumentHub } from '@/components/documents/DocumentHub';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { JoinGateModal } from '@/components/modals/JoinGateModal';
import { MarkdownViewerModal } from '@/components/documents/MarkdownViewerModal';
import { PdfViewerModal } from '@/components/documents/PdfViewerModal';
import { StudentProfileModal } from '@/components/modals/StudentProfileModal';
import { IncomingMessageToast, IncomingNotificationData } from '@/components/common/IncomingMessageToast';
import { ChatMessage } from '@/types';

export default function Home() {
  const {
    classroom,
    setClassroom,
    channels,
    students,
    setStudents,
    pendingRequests,
    setPendingRequests,
    passwordResetRequests,
    setPasswordResetRequests,
    documents,
    setDocuments,
    messages,
    setMessages,
    typingUsers,
    sendTypingStatus,
    onlineUserIds,
    isDataLoaded,
  } = useClassroomData();

  const {
    currentUser,
    setCurrentUser,
    isSessionLoaded,
    prefilledCode,
    handleUserLoggedIn,
    handleAdminLogin,
    handleSignOut,
  } = useUserSession(classroom, students, isDataLoaded);

  // Navigation state
  const [activeView, setActiveView] = useState<'channel' | 'dm' | 'documents' | 'admin'>('channel');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('chn_general');
  const [selectedDmUserId, setSelectedDmUserId] = useState<string>('');

  // Modals state
  const [profileModalUser, setProfileModalUser] = useState<User | null>(null);
  const [activeMarkdownDoc, setActiveMarkdownDoc] = useState<DocumentItem | null>(null);
  const [activePdfDoc, setActivePdfDoc] = useState<DocumentItem | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleOpenDocument = (doc: DocumentItem) => {
    if (doc.fileType === 'pdf') {
      setActivePdfDoc(doc);
    } else {
      setActiveMarkdownDoc(doc);
    }
  };

  useEffect(() => {
    if (activeView === 'admin' && currentUser && currentUser.role !== 'admin') {
      setActiveView('channel');
    }
  }, [activeView, currentUser]);

  const adminUser =
    students.find((s) => s.role === 'admin' || s.id === classroom.adminId) ||
    (currentUser?.role === 'admin' ? currentUser : null) ||
    CURRENT_USER;

  const currentChannel = channels.find((c) => c.id === selectedChannelId);
  const currentRecipient = students.find((s) => s.id === selectedDmUserId);
  const currentConversationKey =
    activeView === 'channel'
      ? selectedChannelId
      : getDmConversationKey(currentUser?.id, selectedDmUserId);

  const currentMessages =
    activeView === 'channel'
      ? (messages[selectedChannelId] || [])
      : (messages[currentConversationKey] || (selectedDmUserId ? messages[`dm_${selectedDmUserId}`] : []) || []);

  const [incomingNotification, setIncomingNotification] = useState<IncomingNotificationData | null>(null);

  useEffect(() => {
    const handleIncoming = (e: CustomEvent<ChatMessage>) => {
      const msg = e.detail;
      if (!msg || !currentUser || msg.senderId === currentUser.id) return;

      const isCurrentlyInThisChat =
        (msg.channelId && activeView === 'channel' && selectedChannelId === msg.channelId) ||
        (!msg.channelId && activeView === 'dm' && selectedDmUserId === msg.senderId);

      if (isCurrentlyInThisChat) return;

      let contentPreview = msg.content;
      if (!contentPreview || contentPreview === '📷 Photo snapshot from study session') {
        if (msg.imageUrl) contentPreview = '📷 Sent a photo';
        else if (msg.videoUrl) contentPreview = '🎥 Sent a video';
        else if (msg.document) contentPreview = `📄 ${msg.document.fileName}`;
        else contentPreview = 'Sent a message';
      }

      setIncomingNotification({
        id: msg.id,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderAvatar: msg.senderAvatar,
        senderRollNo: msg.senderRollNo,
        channelId: msg.channelId,
        content: contentPreview,
        timestamp: msg.timestamp,
      });
    };

    window.addEventListener('classmate:new_incoming_message' as any, handleIncoming);
    return () => {
      window.removeEventListener('classmate:new_incoming_message' as any, handleIncoming);
    };
  }, [currentUser, activeView, selectedChannelId, selectedDmUserId]);

  const handleOpenNotificationConversation = (notif: IncomingNotificationData) => {
    if (notif.channelId) {
      setSelectedChannelId(notif.channelId);
      setSelectedDmUserId('');
      setActiveView('channel');
    } else {
      setSelectedDmUserId(notif.senderId);
      setActiveView('dm');
    }
    setIncomingNotification(null);
    setIsMobileSidebarOpen(false);
  };

  const handleOpenProfileById = (userId: string) => {
    const found = students.find((s) => s.id === userId) || (currentUser && userId === currentUser.id ? currentUser : null);
    if (found) {
      setProfileModalUser(found);
    } else if (adminUser && (userId === classroom.adminId || userId === adminUser.id)) {
      setProfileModalUser(adminUser);
    }
  };

  const actions = useClassroomActions({
    classroom,
    setClassroom,
    students,
    setStudents,
    pendingRequests,
    setPendingRequests,
    passwordResetRequests,
    setPasswordResetRequests,
    documents,
    setDocuments,
    messages,
    setMessages,
    currentUser,
    setCurrentUser,
    onUserLoggedIn: handleUserLoggedIn,
    currentConversationKey,
    selectedChannelId,
    selectedDmUserId,
    activeView,
  });

  if (!isSessionLoaded) {
    return (
      <div className="h-[100dvh] w-screen bg-background flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[image:var(--gradient-brand)] animate-pulse flex items-center justify-center text-white font-display text-2xl shadow-glow-purple">
            C
          </div>
          <p className="text-sm text-muted font-medium">Opening your classroom…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="h-[100dvh] w-screen bg-background flex items-center justify-center p-0 sm:p-4 overflow-y-auto no-scrollbar transition-colors">
        <JoinGateModal
          classroom={classroom}
          existingStudents={students}
          pendingRequests={pendingRequests}
          prefilledCode={prefilledCode}
          onLoginStudent={handleUserLoggedIn}
          onLoginAdmin={handleAdminLogin}
          onCreateClassroom={actions.handleCreateClassroom}
          onJoinSubmitted={(req, targetClassroomId) => {
            const targetId = targetClassroomId || classroom.id;
            setPendingRequests((prev) => [...prev, req]);
            if (targetId) dbCreatePendingRequest(req, targetId);
          }}
          onJoinDirect={(student) => {
            setStudents((prev) => [...prev, student]);
            setClassroom((prev) => ({ ...prev, membersCount: prev.membersCount + 1 }));
            dbCreateStudent(student, classroom.id);
            dbUpdateClassroom(classroom.id, { membersCount: classroom.membersCount + 1 });
            handleUserLoggedIn(student);
          }}
          onRequestPasswordReset={actions.handleRequestPasswordReset}
          onUpdateStudentPassword={actions.handleUpdateStudentPassword}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-screen overflow-hidden bg-background text-foreground antialiased font-sans transition-colors">
      <MobileHeader
        classroom={classroom}
        adminUser={adminUser}
        currentUser={currentUser}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onOpenProfile={(u) => setProfileModalUser(u)}
        onSignOut={handleSignOut}
      />

      {/* Sidebar for Desktop & Mobile drawer */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 transform ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <Sidebar
          classroom={classroom}
          channels={channels}
          students={students}
          currentUser={currentUser}
          activeView={activeView}
          selectedChannelId={selectedChannelId}
          selectedDmUserId={selectedDmUserId}
          pendingRequestsCount={pendingRequests.length}
          documentsCount={documents.length}
          onSelectChannel={(chId) => { setSelectedChannelId(chId); setSelectedDmUserId(''); setActiveView('channel'); setIsMobileSidebarOpen(false); }}
          onSelectDm={(userId) => { setSelectedDmUserId(userId); setActiveView('dm'); setIsMobileSidebarOpen(false); }}
          onSelectView={(view) => { setActiveView(view); setIsMobileSidebarOpen(false); }}
          onOpenSettings={() => setProfileModalUser(currentUser)}
          onOpenProfile={(u) => setProfileModalUser(u)}
          onSignOut={handleSignOut}
          messages={messages}
          onlineUserIds={onlineUserIds}
        />
      </div>

      {isMobileSidebarOpen && (
        <div onClick={() => setIsMobileSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden" />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
        {(activeView === 'channel' || activeView === 'dm') && (
          <ChatContainer
            currentChannel={activeView === 'channel' ? currentChannel : undefined}
            currentRecipient={activeView === 'dm' ? currentRecipient : undefined}
            adminUser={adminUser}
            messages={currentMessages}
            currentUser={currentUser}
            defaultAutoDelete={classroom.autoDeleteSetting}
            onSendMessage={actions.handleSendMessage}
            onOpenDocument={handleOpenDocument}
            onReact={actions.handleReact}
            onAddDocumentToHub={actions.handleAddDocument}
            onDeleteMessage={actions.handleDeleteMessage}
            onDeleteForMe={actions.handleDeleteForMe}
            onClearChat={actions.handleClearChat}
            onOpenProfileById={handleOpenProfileById}
            onBack={activeView === 'dm' ? () => { setActiveView('channel'); setSelectedDmUserId(''); } : undefined}
            typingUser={
              Object.values(typingUsers).find(
                (t) =>
                  t.userId !== currentUser?.id &&
                  (t.conversationKey === currentConversationKey ||
                    (activeView === 'dm' && t.userId === selectedDmUserId))
              ) || null
            }
            onTyping={(isTyping) =>
              sendTypingStatus(isTyping, currentConversationKey, currentUser, activeView === 'dm' ? selectedDmUserId : undefined)
            }
          />
        )}

        {activeView === 'documents' && (
          <DocumentHub
            documents={documents}
            onBack={() => setActiveView('channel')}
            onAddDocument={actions.handleAddDocument}
            onDiscussDoc={(doc) => {
              const matchedChannel = channels.find(
                (c) => c.name.toLowerCase() === doc.subject.toLowerCase() || c.id === doc.sourceChannel
              );
              if (matchedChannel) {
                setSelectedChannelId(matchedChannel.id);
              } else if (channels.length > 0) {
                setSelectedChannelId(channels[0].id);
              }
              setSelectedDmUserId('');
              setActiveView('channel');
            }}
            currentUser={currentUser}
          />
        )}

        {activeView === 'admin' && currentUser?.role === 'admin' && (
          <AdminPanel
            classroom={classroom}
            students={students}
            pendingRequests={pendingRequests}
            passwordResetRequests={passwordResetRequests}
            messages={messages}
            documents={documents}
            onBack={() => setActiveView('channel')}
            onAddStudent={actions.handleAddStudent}
            onBulkAddStudents={actions.handleBulkAddStudents}
            onRemoveStudent={actions.handleRemoveStudent}
            onUpdateStudent={actions.handleUpdateStudent}
            onApproveRequest={actions.handleApproveRequest}
            onApproveAllRequests={actions.handleApproveAllRequests}
            onRejectRequest={actions.handleRejectRequest}
            onUpdateClassroom={actions.handleUpdateClassroom}
            onApprovePasswordReset={actions.handleApprovePasswordReset}
            onRejectPasswordReset={actions.handleRejectPasswordReset}
            onAdminResetPassword={actions.handleAdminResetPassword}
            onResetRoomData={actions.handleResetRoomData}
            onDeleteDocument={actions.handleDeleteDocument}
          />
        )}
      </main>

      {/* Mobile-First Bottom Thumb Dock */}
      <nav className="md:hidden flex-shrink-0 h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-card/95 backdrop-blur-md border-t border-card-border px-2 flex items-center justify-around z-30">
        <button
          type="button"
          onClick={() => {
            setActiveView('channel');
            setIsMobileSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center gap-1 min-h-12 min-w-16 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeView === 'channel' || activeView === 'dm'
              ? 'text-primary font-bold bg-indigo-50 dark:bg-indigo-950/40'
              : 'text-muted font-medium hover:text-foreground'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[11px]">Discuss</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveView('documents');
            setIsMobileSidebarOpen(false);
          }}
          className={`relative flex flex-col items-center justify-center gap-1 min-h-12 min-w-16 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeView === 'documents'
              ? 'text-primary font-bold bg-indigo-50 dark:bg-indigo-950/40'
              : 'text-muted font-medium hover:text-foreground'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[11px]">Vault</span>
          {documents.length > 0 && (
            <span className="absolute -top-0.5 right-1.5 px-1 min-w-[15px] h-3.5 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {documents.length}
            </span>
          )}
        </button>

        {currentUser.role === 'admin' ? (
          <button
            type="button"
            onClick={() => {
              setActiveView('admin');
              setIsMobileSidebarOpen(false);
            }}
            className={`relative flex flex-col items-center justify-center gap-1 min-h-12 min-w-16 py-1 px-3 rounded-xl transition cursor-pointer ${
              activeView === 'admin'
                ? 'text-primary font-bold bg-indigo-50 dark:bg-indigo-950/40'
                : 'text-muted font-medium hover:text-foreground'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[11px]">Admin</span>
            {pendingRequests.length > 0 && (
              <span className="absolute -top-0.5 right-1.5 px-1 min-w-[15px] h-3.5 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setProfileModalUser(currentUser)}
            className="flex flex-col items-center justify-center gap-1 min-h-12 min-w-16 py-1 px-3 rounded-xl text-muted font-medium hover:text-foreground transition cursor-pointer"
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[11px]">Profile</span>
          </button>
        )}
      </nav>

      <MarkdownViewerModal
        document={activeMarkdownDoc}
        isOpen={Boolean(activeMarkdownDoc)}
        onClose={() => setActiveMarkdownDoc(null)}
      />

      <PdfViewerModal
        document={activePdfDoc}
        isOpen={Boolean(activePdfDoc)}
        onClose={() => setActivePdfDoc(null)}
      />

      {currentUser && profileModalUser && (
        <StudentProfileModal
          isOpen={Boolean(profileModalUser)}
          onClose={() => setProfileModalUser(null)}
          user={profileModalUser}
          currentUser={currentUser}
          classroom={classroom}
          students={students}
          onUpdateCurrentUser={actions.handleUpdateCurrentUser}
          onUpdateAutoDelete={(val) => actions.handleUpdateClassroom({ autoDeleteSetting: val })}
          onClearAllChat={actions.handleClearChat}
          onStartDm={(targetUser) => {
            setSelectedDmUserId(targetUser.id);
            setActiveView('dm');
            setProfileModalUser(null);
          }}
          onSignOut={handleSignOut}
          onLeaveClassroom={(successorId) => actions.handleLeaveClassroom(currentUser, successorId)}
        />
      )}

      {/* Social Media Style Incoming Message Toast Notification */}
      <IncomingMessageToast
        notification={incomingNotification}
        onDismiss={() => setIncomingNotification(null)}
        onOpenConversation={handleOpenNotificationConversation}
      />
    </div>
  );
}
