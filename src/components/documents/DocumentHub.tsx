'use client';

import React, { useState } from 'react';
import { FileText, Search, Plus, Sparkles, BookOpen, X, Upload } from 'lucide-react';
import { DocumentItem, User } from '@/types';
import { MarkdownViewerModal } from './MarkdownViewerModal';
import { PdfViewerModal } from './PdfViewerModal';
import { DocumentCard } from './DocumentCard';
import { CreateNoteModal } from './CreateNoteModal';

interface DocumentHubProps {
  documents: DocumentItem[];
  onAddDocument: (doc: DocumentItem) => void;
  onDiscussDoc?: (doc: DocumentItem) => void;
  currentUser?: User | null;
}

export const DocumentHub: React.FC<DocumentHubProps> = ({ documents, onAddDocument, onDiscussDoc, currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'markdown' | 'pdf' | 'exam'>('all');
  const [selectedDocForModal, setSelectedDocForModal] = useState<DocumentItem | null>(null);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);

  const filteredDocs = documents.filter((doc) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesType =
      selectedFilter === 'all'
        ? true
        : selectedFilter === 'exam'
          ? !!doc.isHighExamValue
          : doc.fileType === selectedFilter;

    if (!q) return matchesType;

    const matchesSearch =
      doc.title.toLowerCase().includes(q) ||
      doc.fileName.toLowerCase().includes(q) ||
      doc.subject.toLowerCase().includes(q) ||
      (doc.syllabusModule && doc.syllabusModule.toLowerCase().includes(q)) ||
      doc.tags.some((t) => t.toLowerCase().includes(q));

    return matchesSearch && matchesType;
  });

  const markdownCount = documents.filter((d) => d.fileType === 'markdown').length;
  const pdfCount = documents.filter((d) => d.fileType === 'pdf').length;
  const examCount = documents.filter((d) => d.isHighExamValue).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fafafa] dark:bg-[#1e1e1e] overflow-y-auto no-scrollbar">
      {/* Top Banner */}
      <div className="flex-1 overflow-y-auto bg-[#fafafa] dark:bg-[#1e1e1e] p-3 sm:p-6 lg:p-8 no-scrollbar transition-colors">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#252526] border border-zinc-200 dark:border-[#2d2d2d] shadow-xs space-y-5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-900 dark:text-[#cccccc] border border-zinc-300 dark:border-[#3c3c3c] flex-shrink-0 shadow-2xs">
                    📚 Student Knowledge Vault
                  </span>
                  <span className="text-[11px] sm:text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0 animate-pulse text-emerald-600 dark:text-emerald-400" />
                    Synced with Chat Channels
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight mt-1.5">
                  Classroom Document Hub
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-[#858585] mt-1 max-w-xl leading-relaxed">
                  Shared notes, PDF summaries, cheat sheets, and study materials organized in one peer-to-peer repository.
                </p>
              </div>

              <button
                onClick={() => setIsNewDocModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-zinc-950 dark:bg-[#0e639c] hover:bg-zinc-800 dark:hover:bg-[#1177bb] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Document / Note</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-[#858585]" />
                <input
                  type="text"
                  placeholder="Search notes, subjects, formulas, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-[#3c3c3c] border border-zinc-200 dark:border-[#2d2d2d] rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder:text-[#858585] focus:outline-none focus:border-zinc-950 dark:focus:border-[#007acc] focus:bg-white dark:focus:bg-[#3c3c3c] transition shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-[#858585] hover:text-zinc-700 dark:hover:text-white p-0.5 rounded-md cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${selectedFilter === 'all'
                      ? 'bg-zinc-950 dark:bg-[#0e639c] text-white shadow-2xs border border-zinc-950 dark:border-[#0e639c]'
                      : 'bg-white dark:bg-[#252526] text-zinc-600 dark:text-[#cccccc] hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#2a2d2e] border border-zinc-200 dark:border-[#2d2d2d]'
                    }`}
                >
                  All ({documents.length})
                </button>

                <button
                  onClick={() => setSelectedFilter('markdown')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${selectedFilter === 'markdown'
                      ? 'bg-zinc-950 dark:bg-[#0e639c] text-white shadow-2xs border border-zinc-950 dark:border-[#0e639c]'
                      : 'bg-white dark:bg-[#252526] text-zinc-600 dark:text-[#cccccc] hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#2a2d2e] border border-zinc-200 dark:border-[#2d2d2d]'
                    }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Notes ({markdownCount})</span>
                </button>

                <button
                  onClick={() => setSelectedFilter('pdf')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${selectedFilter === 'pdf'
                      ? 'bg-zinc-950 dark:bg-[#0e639c] text-white shadow-2xs border border-zinc-950 dark:border-[#0e639c]'
                      : 'bg-white dark:bg-[#252526] text-zinc-600 dark:text-[#cccccc] hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#2a2d2e] border border-zinc-200 dark:border-[#2d2d2d]'
                    }`}
                >
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  <span>PDFs ({pdfCount})</span>
                </button>

                <button
                  onClick={() => setSelectedFilter('exam')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${selectedFilter === 'exam'
                      ? 'bg-amber-500 text-white shadow-2xs border border-amber-500'
                      : 'bg-white dark:bg-[#252526] text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40'
                    }`}
                >
                  <span>⭐ Exam Yield ({examCount})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-300 rounded-3xl p-8 bg-white backdrop-blur-sm space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center mx-auto shadow-2xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950">No documents found</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1 leading-relaxed">
                {searchQuery
                  ? `No study materials matched "${searchQuery}". Try a different keyword.`
                  : 'Your document vault is fresh and empty. Share a PDF or markdown note to start the collection!'}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setIsNewDocModalOpen(true)}
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Upload or Create Document
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onSelectDoc={setSelectedDocForModal}
                onDiscussDoc={onDiscussDoc}
              />
            ))}
          </div>
        )}
      </div>

      {/* Document Reader Modals: PDF or Markdown */}
      {selectedDocForModal?.fileType === 'pdf' ? (
        <PdfViewerModal
          document={selectedDocForModal}
          isOpen={Boolean(selectedDocForModal)}
          onClose={() => setSelectedDocForModal(null)}
        />
      ) : (
        <MarkdownViewerModal
          document={selectedDocForModal}
          isOpen={Boolean(selectedDocForModal)}
          onClose={() => setSelectedDocForModal(null)}
        />
      )}

      {/* New Note or PDF Upload Modal */}
      <CreateNoteModal
        isOpen={isNewDocModalOpen}
        onClose={() => setIsNewDocModalOpen(false)}
        onAddDocument={onAddDocument}
        currentUser={currentUser}
      />
    </div>
  );
};
