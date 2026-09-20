'use client';

import React, { useState, useRef } from 'react';
import { Send, Camera, Paperclip, Loader2 } from 'lucide-react';
import { AutoDeleteOption, DocumentItem, ChatMessage, ChatReplyReference } from '@/types';
import { ReplyContextBanner } from './ReplyContextBanner';
import { uploadClassroomFile } from '@/lib/storageService';
import { validateCameraPhotoFile } from '@/lib/security/inputSanitizer';

interface ChatInputProps {
  placeholder: string;
  defaultAutoDelete: AutoDeleteOption;
  replyingTo?: ChatMessage | null;
  onCancelReply?: () => void;
  onSendMessage: (payload: {
    content: string;
    autoDelete: AutoDeleteOption;
    imageUrl?: string;
    videoUrl?: string;
    document?: DocumentItem;
    replyTo?: ChatReplyReference;
  }) => void;
  onAddDocumentToHub: (doc: DocumentItem) => void;
  onTyping?: (isTyping: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  placeholder,
  defaultAutoDelete,
  replyingTo,
  onCancelReply,
  onSendMessage,
  onAddDocumentToHub,
  onTyping,
}) => {
  const [text, setText] = useState('');
  const [autoDelete, setAutoDelete] = useState<AutoDeleteOption>(defaultAutoDelete);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when replying starts
  React.useEffect(() => {
    if (replyingTo) {
      textInputRef.current?.focus();
    }
  }, [replyingTo]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);

    if (onTyping) {
      if (val.trim().length > 0) {
        onTyping(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
          onTyping(false);
        }, 2200);
      } else {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        onTyping(false);
      }
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    onTyping?.(false);

    const replyRef: ChatReplyReference | undefined = replyingTo
      ? {
          id: replyingTo.id,
          senderName: replyingTo.senderName,
          senderRollNo: replyingTo.senderRollNo,
          content: (replyingTo.content || '').slice(0, 120),
          imageUrl: replyingTo.imageUrl,
          videoUrl: replyingTo.videoUrl,
          hasDocument: Boolean(replyingTo.document),
        }
      : undefined;

    onSendMessage({
      content: text.trim(),
      autoDelete: autoDelete,
      replyTo: replyRef,
    });
    setText('');
    onCancelReply?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && replyingTo) {
      e.preventDefault();
      onCancelReply?.();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCameraPhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict validation: Camera is strictly for photos/images (reject videos, pdfs, docs)
    const validation = validateCameraPhotoFile(file);
    if (!validation.isValidPhoto) {
      alert(validation.errorMessage || 'The camera button is strictly for photos. To send videos or documents, please use the paperclip attachment icon.');
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const uploadRes = await uploadClassroomFile(file, file.name || `photo_${Date.now()}.jpg`);

      const replyRef: ChatReplyReference | undefined = replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            senderRollNo: replyingTo.senderRollNo,
            content: (replyingTo.content || '').slice(0, 120),
            imageUrl: replyingTo.imageUrl,
            videoUrl: replyingTo.videoUrl,
            hasDocument: Boolean(replyingTo.document),
          }
        : undefined;

      onSendMessage({
        content: text.trim(),
        autoDelete: autoDelete,
        imageUrl: uploadRes.url,
        replyTo: replyRef,
      });

      if (text) setText('');
      onCancelReply?.();
    } catch (err) {
      console.error('Failed to upload photo from camera:', err);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogg)$/i.test(file.name);
    const isMarkdown = file.name.endsWith('.md') || file.type.includes('markdown');
    const isPdf = file.name.endsWith('.pdf') || file.type.includes('pdf');

    const uploadRes = await uploadClassroomFile(file, file.name);

    if (isImage) {
      onSendMessage({
        content: text.trim(),
        autoDelete: autoDelete,
        imageUrl: uploadRes.url,
      });
      if (text) setText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (isVideo) {
      onSendMessage({
        content: text.trim(),
        autoDelete: autoDelete,
        videoUrl: uploadRes.url,
      });
      if (text) setText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    let textContent = '';
    if (isMarkdown) {
      try {
        textContent = await file.text();
      } catch {
        textContent = '';
      }
    }

    const newDoc: DocumentItem = {
      id: `doc_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      fileName: file.name,
      fileType: isMarkdown ? 'markdown' : isPdf ? 'pdf' : 'code',
      fileSize: uploadRes.sizeFormatted,
      uploadedBy: 'member',
      uploaderName: 'Classroom Member',
      uploadedAt: 'Just now',
      subject: 'Shared Class Material',
      source: 'chat',
      downloadUrl: uploadRes.url,
      tags: ['Shared-In-Chat', 'Classmate'],
      content: isMarkdown ? textContent : (uploadRes.isStorageUrl ? undefined : uploadRes.url),
    };

    onSendMessage({
      content: text.trim(),
      autoDelete: autoDelete,
      document: newDoc,
    });
    if (text) setText('');

    onAddDocumentToHub(newDoc);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-2 sm:p-3 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] sm:pb-3 border-t border-[#DFD3E7] dark:border-zinc-800/80 bg-[#FAF7FD]/95 dark:bg-[#121214]/95 backdrop-blur-2xl flex-shrink-0 w-full transition-colors">
      {/* Reply Context Banner when replying */}
      <ReplyContextBanner replyingTo={replyingTo || null} onCancelReply={onCancelReply || (() => {})} />

      {/* Input Capsule Row */}
      <div className="flex items-center gap-1 sm:gap-2 bg-[#F1EBF5] dark:bg-[#18181b] border border-[#DFD3E7] dark:border-zinc-800 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:bg-[#FAF7FD] dark:focus-within:bg-[#18181b] focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-2xl sm:rounded-full px-2 py-1.5 transition-all shadow-xs w-full">
        {/* Attachment Options */}
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.pdf,.txt,.doc,.docx,image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 sm:p-2 text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-zinc-800 rounded-full transition cursor-pointer"
            title="Attach Document or Notes"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Native Camera Photo Input (Photos Only) */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraPhotoCapture}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="p-1.5 sm:p-2 text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-zinc-800 rounded-full transition cursor-pointer disabled:opacity-50"
            title="Take Photo (Photos only)"
          >
            {isUploadingPhoto ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Text Input */}
        <input
          ref={textInputRef}
          type="text"
          placeholder={placeholder}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 bg-transparent border-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none px-2 py-1 font-[450]"
        />

        {/* Send Button with Stitch Gradient */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-90 disabled:opacity-30 text-white flex items-center justify-center shadow-glow-purple transition-all active:scale-95 flex-shrink-0 cursor-pointer"
          title="Send message"
        >
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};
