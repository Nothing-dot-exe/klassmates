# Classmate — Privacy & Data Protection Architecture

> **A strictly private, closed-network academic workspace built exclusively for your classroom.**  
> *This document provides an open-source technical audit guide. Every claim references the exact source code files so auditors, developers, and students can inspect the raw implementation.*

---

## 1. Core Privacy Philosophy
Classmate is engineered from the ground up to respect student privacy and autonomy.
* **No Third-Party Tracking**: Zero telemetry, zero analytics scripts, and zero advertising trackers.
* **No Data Monetization**: Student discussions, notes, and direct messages are never indexed, analyzed, or shared with third parties.
* **Closed-Classroom Boundary**: Access is strictly limited to enrolled classmates who have joined using the designated Classroom Code.
  * 📁 **Source Code**: [`src/components/modals/JoinGateModal.tsx`](../src/components/modals/JoinGateModal.tsx) & [`src/lib/database/classroomDb.ts`](../src/lib/database/classroomDb.ts)

---

## 2. Messaging & Deletion Policy

### A. Personal 1-on-1 Direct Messages (DMs)
* **Author Ownership**: Each student has full ownership over the messages they send in private chats.
* **True Database Hard-Deletion ("Unsend")**:
  * When a student deletes their message in a 1-on-1 chat, the row is **permanently purged** from the Supabase PostgreSQL database (`DELETE FROM messages WHERE id = $id`).
  * It is not soft-deleted or hidden behind an administrative back door. It is 100% destroyed.
  * Realtime WebSockets instantly signal the recipient's phone/browser to remove the message bubble from their screen.
  * 📁 **Source Code**:
    * Database Hard-Delete Operation: [`src/lib/database/messagesDb.ts`](../src/lib/database/messagesDb.ts) (`dbDeleteMessage`)
    * Action Dispatcher: [`src/hooks/useChatActions.ts`](../src/hooks/useChatActions.ts) (`handleDeleteMessage`)
    * UI Permission Guard (Only Author Can Delete): [`src/components/chat/DirectMessageRow.tsx`](../src/components/chat/DirectMessageRow.tsx)
* **Eavesdropping Protection**:
  * Direct messages are isolated at the database query level.
  * A student can only query messages where `sender_id` or `recipient_id` matches their own verified session. Other classmates cannot sniff, list, or download private conversations.
  * 📁 **Source Code**:
    * Scoped Query Filter: [`src/lib/database/messagesDb.ts`](../src/lib/database/messagesDb.ts) (`dbFetchMessages`)
    * Session ID Extractor: [`src/lib/chatUtils.ts`](../src/lib/chatUtils.ts) (`getCurrentSessionUserId`)
    * WebSocket Client-Side Isolation: [`src/hooks/useRealtimeSync.ts`](../src/hooks/useRealtimeSync.ts) (`handleIncomingMessage`)

### B. Group Classroom Channels (e.g., `#general`)
* **Student Deletion**: Students can permanently delete their own posts, questions, and uploaded images at any time.
* **Class Representative (CR) Moderation**:
  * Class Reps / Admins have the ability to delete any message in group channels.
  * This is required to moderate spam, academic integrity violations, or accidental leaks of personal information.
  * When a CR deletes a message, it is permanently purged from the database and all devices.
* **Other Classmates**: Normal students **cannot** delete messages sent by other classmates.
  * 📁 **Source Code**:
    * Role-Based Deletion Guard: [`src/components/chat/ChannelMessageRow.tsx`](../src/components/chat/ChannelMessageRow.tsx) (`const canDelete = isMine || currentUserRole === 'admin'`)
    * Broadcast Deletion to Room: [`src/lib/realtimeService.ts`](../src/lib/realtimeService.ts) (`broadcastMessageDeleted`)

---

## 3. Disappearing & Auto-Expiring Messages
* Classmate supports self-destructing messages:
  * **24 Hours**: Automatically purged 24 hours after creation.
  * **7 Days**: Automatically purged 7 days after creation.
  * **Never**: Retained until manually deleted by the author or Class Rep.
* **Database Pruning**: Messages with an expiration date store an `expires_at` ISO timestamp. Whenever the database is accessed, expired messages are systematically deleted from the server.
  * 📁 **Source Code**:
    * Auto-Delete Options & Expiration Calculation: [`src/hooks/useChatActions.ts`](../src/hooks/useChatActions.ts) (`handleSendMessage`)
    * Scheduled Database Purge Routine: [`src/lib/database/messagesDb.ts`](../src/lib/database/messagesDb.ts) (`dbPruneExpiredMessages`)
    * User Preference Settings: [`src/components/modals/profile/ProfileSettingsSection.tsx`](../src/components/modals/profile/ProfileSettingsSection.tsx)

---

## 4. Academic Document Vault Privacy
* **Course Materials**: Lecture slides, past exam papers, and syllabus notes shared in the Document Vault are scoped strictly to the enrolled classroom.
* **Document Deletion**:
  * The uploader can delete their document at any time.
  * The Class Rep can curate and remove obsolete files.
  * Deleting a document removes both the database catalog row and its active link.
  * 📁 **Source Code**:
    * Document Database CRUD: [`src/lib/database/documentsDb.ts`](../src/lib/database/documentsDb.ts) (`dbDeleteDocument`)
    * Document Action Handlers: [`src/hooks/useChatActions.ts`](../src/hooks/useChatActions.ts) (`handleDeleteDocument`)
    * Document Vault UI: [`src/components/documents/DocumentVaultView.tsx`](../src/components/documents/DocumentVaultView.tsx)

---

## 5. Account, Profile & Identity Security
* **Authentication & PINs**: Passwords and PIN codes are encrypted and checked against secure credential columns in the database.
* **Contact Information**:
  * Phone numbers and emails provided in student profiles are strictly visible to classmates within the same private room (for peer study coordination).
  * Students can customize their display nicknames or toggle visibility.
* **Session Storage**:
  * Sessions are maintained using lightweight, secure browser storage (`localStorage` and `sessionStorage`).
  * Clearing browser data or signing out destroys active tokens immediately.
  * 📁 **Source Code**:
    * Student Credential Verification: [`src/lib/database/studentsDb.ts`](../src/lib/database/studentsDb.ts)
    * Classroom Security Credentials: [`src/lib/database/classroomDb.ts`](../src/lib/database/classroomDb.ts) (`dbVerifyClassroomPin`)
    * Profile & Nickname Management: [`src/components/modals/StudentProfileModal.tsx`](../src/components/modals/StudentProfileModal.tsx)

---

## 6. Data Portability & Export
* **One-Click Backup**:
  * Before clearing channel history or personal chats, users can download a complete, offline JSON backup file of their conversation history.
  * You always retain full custody and portability over your study notes and discussions.
  * 📁 **Source Code**:
    * JSON Exporter Routine: [`src/lib/backupExporter.ts`](../src/lib/backupExporter.ts) (`exportAndDownloadRoomBackup`)
    * Export Trigger in Chat Header: [`src/components/chat/ChatContainer.tsx`](../src/components/chat/ChatContainer.tsx) & [`src/components/chat/ChatHeader.tsx`](../src/components/chat/ChatHeader.tsx)

---

## 7. Open-Source Technical Architecture Directory

| Privacy / Security Layer | Purpose | Primary Implementation File(s) |
| :--- | :--- | :--- |
| **Direct Message Privacy & Routing** | Scoped querying and deterministic conversation keys | [`src/lib/chatUtils.ts`](../src/lib/chatUtils.ts) |
| **Database Operations (PostgreSQL)** | Permanent hard deletion, pruning, message insertion | [`src/lib/database/messagesDb.ts`](../src/lib/database/messagesDb.ts) |
| **Realtime WebSocket Protocol** | Instant peer notification without logging to 3rd parties | [`src/lib/realtimeService.ts`](../src/lib/realtimeService.ts) |
| **Classroom Boundaries & Access** | 6-character room codes and PIN access controls | [`src/lib/database/classroomDb.ts`](../src/lib/database/classroomDb.ts) |
| **Student Roster & Verification** | Student accounts, join requests, approval flows | [`src/lib/database/studentsDb.ts`](../src/lib/database/studentsDb.ts) |
| **Document Vault Security** | Lecture notes and exam handout access control | [`src/lib/database/documentsDb.ts`](../src/lib/database/documentsDb.ts) |
| **Offline Data Portability** | 1-click JSON backup export engine | [`src/lib/backupExporter.ts`](../src/lib/backupExporter.ts) |
| **Database Schema & SQL Policies** | Relational tables and constraints | [`supabase_schema.sql`](../supabase_schema.sql) |

---

*Last Updated: September 2026*  
*Classmate Open-Source Academic Workspace*
