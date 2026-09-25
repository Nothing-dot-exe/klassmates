import React, { useState, useRef } from 'react';
import { BookOpen, FileText, Upload, Check, X, Sparkles } from 'lucide-react';
import { DocumentItem, User } from '@/types';
import { uploadClassroomFile } from '@/lib/storageService';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDocument: (doc: DocumentItem) => void;
  currentUser?: User | null;
}

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  isOpen,
  onClose,
  onAddDocument,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'pdf'>('markdown');
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newSyllabusModule, setNewSyllabusModule] = useState('');
  const [isHighExamValue, setIsHighExamValue] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  // PDF Upload State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
  const [pdfFileSize, setPdfFileSize] = useState<string>('');
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePdfSelected = (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.includes('pdf')) {
      alert('Please select a valid PDF file.');
      return;
    }

    setPdfFile(file);
    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024) || 1} KB`;
    setPdfFileSize(sizeStr);

    if (!newTitle) {
      setNewTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }

    setIsReadingPdf(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = (e.target?.result as string) || '';
      setPdfDataUrl(result);
      setIsReadingPdf(false);
    };
    reader.onerror = () => {
      alert('Could not read the PDF file. Please try again.');
      setIsReadingPdf(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const authorName = currentUser?.nickname?.trim() || currentUser?.name || 'Classmate';
    const authorId = currentUser?.id || 'member';

    if (activeTab === 'markdown') {
      const newDoc: DocumentItem = {
        id: `doc_${Date.now()}`,
        title: newTitle.trim(),
        fileName: `${newTitle.trim().replace(/\s+/g, '_')}.md`,
        fileType: 'markdown',
        fileSize: `${Math.round(newContent.length / 1024) + 1} KB`,
        uploadedBy: authorId,
        uploaderName: authorName,
        uploadedAt: 'Just now',
        subject: newSubject.trim() || 'General Study',
        syllabusModule: newSyllabusModule.trim() || undefined,
        isHighExamValue: isHighExamValue,
        source: 'direct_upload',
        downloadUrl: `data:text/markdown;charset=utf-8,${encodeURIComponent(newContent || `# ${newTitle}\n\nStudy Notes`)}`,
        tags: newTags ? newTags.split(',').map((t) => t.trim()).filter(Boolean) : ['Classmate', 'Notes'],
        content: newContent || `# ${newTitle}\n\nNotes created directly in Document Vault.`,
      };
      onAddDocument(newDoc);
    } else {
      if (!pdfFile && !pdfDataUrl) {
        alert('Please select a PDF document first.');
        return;
      }

      let downloadUrl = pdfDataUrl;
      let fileSize = pdfFileSize || 'PDF Document';
      let contentVal: string | undefined = pdfDataUrl;

      if (pdfFile) {
        const uploadRes = await uploadClassroomFile(pdfFile, pdfFile.name);
        downloadUrl = uploadRes.url;
        fileSize = uploadRes.sizeFormatted;
        if (uploadRes.isStorageUrl) {
          contentVal = undefined;
        }
      }

      const newDoc: DocumentItem = {
        id: `doc_${Date.now()}`,
        title: newTitle.trim(),
        fileName: pdfFile?.name || `${newTitle.trim().replace(/\s+/g, '_')}.pdf`,
        fileType: 'pdf',
        fileSize,
        uploadedBy: authorId,
        uploaderName: authorName,
        uploadedAt: 'Just now',
        subject: newSubject.trim() || 'Class Material',
        syllabusModule: newSyllabusModule.trim() || undefined,
        isHighExamValue: isHighExamValue,
        source: 'direct_upload',
        downloadUrl,
        tags: newTags ? newTags.split(',').map((t) => t.trim()).filter(Boolean) : ['Classmate', 'PDF'],
        content: contentVal,
      };
      onAddDocument(newDoc);
    }

    onClose();
    setNewTitle('');
    setNewSubject('');
    setNewSyllabusModule('');
    setIsHighExamValue(false);
    setNewContent('');
    setNewTags('');
    setPdfFile(null);
    setPdfDataUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-zinc-200 dark:border-card-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-card-border bg-zinc-50/80 dark:bg-card-muted flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-zinc-100 dark:bg-[#24302c] text-zinc-900 dark:text-indigo-400 border border-zinc-200 dark:border-card-border">
              {activeTab === 'markdown' ? <BookOpen className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                {activeTab === 'markdown' ? 'Create Markdown Note' : 'Upload PDF Document'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Add learning material directly to your student repository</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-[#24302c] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 dark:border-card-border bg-zinc-50 dark:bg-card p-1.5 gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('markdown')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${activeTab === 'markdown'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow-purple'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#18181b]'
              }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Write Markdown Note</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${activeTab === 'pdf'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow-purple'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#18181b]'
              }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Upload PDF Document</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto no-scrollbar flex-1">
          {/* PDF Upload Dropzone (When in PDF mode) */}
          {activeTab === 'pdf' && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePdfSelected(file);
                }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${pdfFile
                    ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20'
                    : 'border-zinc-300 dark:border-card-border hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-zinc-50/80 dark:hover:bg-[#18181b] bg-zinc-50/40 dark:bg-card-muted/40'
                  }`}
              >
                {isReadingPdf ? (
                  <div className="space-y-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Processing PDF document...</p>
                  </div>
                ) : pdfFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-card-muted text-indigo-600 dark:text-indigo-400 border border-zinc-300 dark:border-card-border">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                        <span className="truncate max-w-xs">{pdfFile.name}</span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-[#24302c] border border-indigo-200 dark:border-indigo-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                          Ready
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                        {pdfFileSize} • Tap to change file
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-card-muted text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-zinc-200 dark:border-card-border">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-950 dark:text-white">
                        Click to select or drop your PDF document
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Course syllabus, past papers, lecture slides, or textbooks
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
              {activeTab === 'markdown' ? 'Note Title' : 'Document Title'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={activeTab === 'markdown' ? 'e.g. Computer Networks: OSI 7 Layer Model' : 'e.g. Data Structures & Algorithms Syllabus'}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-card-muted border border-zinc-200 dark:border-card-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#24302c] transition shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">Course / Subject</label>
              <input
                type="text"
                placeholder="e.g. Computer Networks"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-card-muted border border-zinc-200 dark:border-card-border rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#24302c] transition shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="OSI, TCP/IP, Unit-2"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-card-muted border border-zinc-200 dark:border-card-border rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#24302c] transition font-mono shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">Syllabus Module / Unit</label>
              <input
                type="text"
                placeholder="e.g. Module 2: OSI Layer or 2024 Midterm"
                value={newSyllabusModule}
                onChange={(e) => setNewSyllabusModule(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-card-muted border border-zinc-200 dark:border-card-border rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#24302c] transition shadow-xs"
              />
            </div>
            <div className="pt-2 sm:pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 px-3.5 py-2 rounded-xl transition">
                <input
                  type="checkbox"
                  checked={isHighExamValue}
                  onChange={(e) => setIsHighExamValue(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
                />
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  ⭐ High Exam Yield (Critical for Midterm/Finals)
                </span>
              </label>
            </div>
          </div>

          {activeTab === 'markdown' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
                Markdown Content (Supports # Headers, ```code, tables)
              </label>
              <textarea
                rows={8}
                placeholder="# Chapter Overview&#10;&#10;Key definitions and formulas...&#10;&#10;```python&#10;# Code example&#10;```"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-card-muted border border-zinc-200 dark:border-card-border rounded-xl p-3 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#24302c] transition shadow-xs"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-card-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={activeTab === 'pdf' && !pdfDataUrl}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-95 text-white text-xs font-bold shadow-glow-purple transition active:scale-95 cursor-pointer disabled:opacity-40"
            >
              {activeTab === 'markdown' ? 'Save Note to Vault' : 'Upload PDF to Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
