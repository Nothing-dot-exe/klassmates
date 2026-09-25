'use client';

import React, { useState } from 'react';
import { FileText, Search, Plus, Sparkles, BookOpen, X, Upload, ArrowLeft } from 'lucide-react';
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
  onBack?: () => void;
}

export const DocumentHub: React.FC<DocumentHubProps> = ({ documents, onAddDocument, onDiscussDoc, currentUser, onBack }) => {
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
    <div className="flex-1 h-full bg-background overflow-y-auto no-scrollbar transition-colors p-3 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6 pb-12">
        {/* Header Banner */}
        <div className="p-4 sm:p-6 rounded-3xl bg-card border border-card-border shadow-sm space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center flex-wrap gap-2 mb-1.5">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-card-muted dark:bg-card-muted text-slate-700 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white border border-card-border dark:border-zinc-800 text-xs font-bold transition active:scale-95 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Chat</span>
                  </button>
                )}
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-card-muted dark:bg-zinc-800 text-slate-900 dark:text-zinc-200 border border-card-border dark:border-zinc-700 flex-shrink-0 shadow-2xs">
                  📚 Student Knowledge Vault
                </span>
                <span className="text-[11px] sm:text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0 animate-pulse text-emerald-600 dark:text-emerald-400" />
                  Synced with Chat Channels
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-display text-foreground tracking-tight">
                Classroom Document Hub
              </h1>
              <p className="text-sm text-muted mt-0.5 max-w-xl leading-relaxed">
                Shared notes, PDF summaries, cheat sheets, and study materials organized in one peer-to-peer repository.
              </p>
            </div>

            <button
              onClick={() => setIsNewDocModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-95 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-glow-purple transition active:scale-95 cursor-pointer flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document / Note</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 border-t border-card-border dark:border-zinc-800/60">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search notes, subjects, formulas, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background dark:bg-card-muted border border-card-border dark:border-zinc-800 rounded-2xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white p-0.5 rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  selectedFilter === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow-purple'
                    : 'bg-card dark:bg-card-muted text-slate-600 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-card-muted dark:hover:bg-zinc-800/80 border border-card-border dark:border-zinc-800'
                }`}
              >
                All ({documents.length})
              </button>

              <button
                onClick={() => setSelectedFilter('markdown')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  selectedFilter === 'markdown'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow-purple'
                    : 'bg-card dark:bg-card-muted text-slate-600 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-card-muted dark:hover:bg-zinc-800/80 border border-card-border dark:border-zinc-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Notes ({markdownCount})</span>
              </button>

              <button
                onClick={() => setSelectedFilter('pdf')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  selectedFilter === 'pdf'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow-purple'
                    : 'bg-card dark:bg-card-muted text-slate-600 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-card-muted dark:hover:bg-zinc-800/80 border border-card-border dark:border-zinc-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                <span>PDFs ({pdfCount})</span>
              </button>

              <button
                onClick={() => setSelectedFilter('exam')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  selectedFilter === 'exam'
                    ? 'bg-amber-500 text-white shadow-glow-gold'
                    : 'bg-card dark:bg-card-muted text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40'
                }`}
              >
                <span>⭐ Exam Yield ({examCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Documents Grid / Empty State */}
        <div>
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 sm:py-16 border border-dashed border-card-border dark:border-card-border rounded-3xl p-6 sm:p-8 bg-card dark:bg-card backdrop-blur-sm space-y-3 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-card-muted text-zinc-900 dark:text-indigo-400 border border-zinc-200 dark:border-card-border flex items-center justify-center mx-auto shadow-2xs">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">No documents found</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1 leading-relaxed">
                  {searchQuery
                    ? `No study materials matched "${searchQuery}". Try a different keyword.`
                    : 'Your document vault is fresh and empty. Share a PDF or markdown note to start the collection!'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setIsNewDocModalOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-95 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 shadow-glow-purple active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Upload or Create Document
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
