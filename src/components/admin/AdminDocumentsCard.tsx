import React, { useState } from 'react';
import { FileText, Trash2, Search, BookOpen } from 'lucide-react';
import { DocumentItem } from '@/types';

interface AdminDocumentsCardProps {
  documents: DocumentItem[];
  onDeleteDocument?: (docId: string) => void;
  showToast: (msg: string) => void;
}

export const AdminDocumentsCard: React.FC<AdminDocumentsCardProps> = ({
  documents,
  onDeleteDocument,
  showToast,
}) => {
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.subject.toLowerCase().includes(search.toLowerCase()) ||
    d.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (doc: DocumentItem) => {
    if (onDeleteDocument) {
      onDeleteDocument(doc.id);
      showToast(`Document "${doc.title}" deleted.`);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-[#252526] border border-zinc-300 dark:border-[#2d2d2d] rounded-3xl p-4 sm:p-8 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-[#2d2d2d]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-900 dark:text-white border border-zinc-300 dark:border-[#4a4a4a]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-950 dark:text-white flex items-center gap-2">
              Classroom Document Management
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-900 dark:text-white font-bold border border-zinc-300 dark:border-[#4a4a4a]">
                {documents.length} Files
              </span>
            </h3>
            <p className="text-xs text-zinc-600 dark:text-[#858585] font-medium">Manage, inspect, and remove notes or shared files from the classroom vault.</p>
          </div>
        </div>

        {documents.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-[#858585]" />
            <input
              type="text"
              placeholder="Filter documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-[#1e1e1e] border border-zinc-300 dark:border-[#3c3c3c] rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-950 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-[#858585] focus:outline-none focus:border-zinc-950 dark:focus:border-[#007acc] focus:bg-white dark:focus:bg-[#1e1e1e] transition shadow-2xs font-medium"
            />
          </div>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-zinc-300 dark:border-[#3c3c3c] rounded-2xl p-4 text-xs text-zinc-600 dark:text-[#858585] font-medium">
          No documents or notes have been uploaded to this classroom yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-6 text-xs text-zinc-600 dark:text-[#858585] font-medium">
          No documents matching &quot;{search}&quot;.
        </div>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-[#2d2d2d] max-h-80 overflow-y-auto no-scrollbar">
          {filtered.map((doc) => {
            const isConfirming = confirmDeleteId === doc.id;
            return (
              <div key={doc.id} className="py-3 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl border border-zinc-300 dark:border-[#3c3c3c] bg-zinc-100 dark:bg-[#1e1e1e] text-zinc-900 dark:text-white flex-shrink-0">
                    {doc.fileType === 'markdown' ? <BookOpen className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-950 dark:text-white truncate group-hover:text-zinc-700 dark:group-hover:text-[#9cdcfe] transition">
                      {doc.title}
                    </div>
                    <div className="text-[10px] text-zinc-600 dark:text-[#858585] font-medium flex items-center gap-2 flex-wrap">
                      <span>{doc.subject}</span>
                      <span>•</span>
                      <span>By {doc.uploaderName}</span>
                      <span>•</span>
                      <span>{doc.fileSize}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isConfirming ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in">
                      <span className="text-[10px] text-rose-600 font-bold hidden sm:inline">Delete?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition shadow-xs cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-[#3c3c3c] text-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-[#4a4a4a] text-[11px] font-semibold transition cursor-pointer border border-zinc-300 dark:border-[#4a4a4a]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(doc.id)}
                      className="p-2 rounded-xl bg-zinc-100 dark:bg-[#3c3c3c] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-zinc-600 dark:text-[#858585] hover:text-rose-600 dark:hover:text-rose-400 border border-zinc-300 dark:border-[#4a4a4a] hover:border-rose-300 transition active:scale-95 cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
