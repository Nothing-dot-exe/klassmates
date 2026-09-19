import React from 'react';
import { Eye, Download, MessageSquare, Star, Sparkles, BookOpen } from 'lucide-react';
import { DocumentItem } from '@/types';

interface DocumentCardProps {
  doc: DocumentItem;
  onSelectDoc: (doc: DocumentItem) => void;
  onDiscussDoc?: (doc: DocumentItem) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onSelectDoc, onDiscussDoc }) => {
  const handleDownload = () => {
    let url = doc.downloadUrl && doc.downloadUrl !== '#' ? doc.downloadUrl : '';
    if (!url && doc.content) {
      if (doc.content.startsWith('data:')) {
        url = doc.content;
      } else {
        const mimeType = doc.fileType === 'pdf' ? 'application/pdf' : 'text/plain;charset=utf-8';
        const blob = new Blob([doc.content], { type: mimeType });
        url = URL.createObjectURL(blob);
      }
    }
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName || `${doc.title}.${doc.fileType === 'pdf' ? 'pdf' : 'txt'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    }
  };

  // Dynamic subject spine color
  const getSubjectSpineClass = (subject: string) => {
    const s = (subject || '').toLowerCase();
    if (s.includes('cs') || s.includes('algo') || s.includes('code')) return 'border-l-indigo-500';
    if (s.includes('math') || s.includes('stat') || s.includes('discrete')) return 'border-l-purple-500';
    if (s.includes('physics') || s.includes('elect')) return 'border-l-cyan-500';
    if (s.includes('exam') || s.includes('question') || s.includes('midterm')) return 'border-l-amber-500';
    return 'border-l-emerald-500';
  };

  return (
    <div
      onClick={() => onSelectDoc(doc)}
      className={`group relative bg-white dark:bg-[#121214] border border-slate-200 dark:border-zinc-800/90 border-l-[3.5px] ${getSubjectSpineClass(
        doc.subject
      )} hover:border-indigo-400 dark:hover:border-indigo-500/80 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer`}
    >
      <div>
        {/* Card Header: Type Badge, Syllabus Module & High Exam Value */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 shadow-2xs">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  doc.fileType === 'markdown' ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-rose-500'
                }`}
              />
              {doc.fileType === 'markdown' ? 'Markdown Note' : 'PDF Document'}
            </span>

            {doc.isHighExamValue && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center gap-1 shadow-2xs">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                Exam Yield
              </span>
            )}
          </div>

          {doc.source === 'chat' ? (
            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Chat Synced
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
              {doc.fileSize}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
          {doc.title}
        </h3>

        {/* Subject and Module */}
        <div className="flex items-center flex-wrap gap-1.5 mt-2 text-xs">
          <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-indigo-500" />
            {doc.subject || 'General Academic'}
          </span>
          {doc.syllabusModule && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50 text-[10px] font-mono">
              {doc.syllabusModule}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {doc.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-slate-50 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-800 font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-500 dark:text-zinc-400 min-w-0">
          <div className="truncate font-medium text-slate-700 dark:text-zinc-300">By {doc.uploaderName || 'Classmate'}</div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">{doc.fileName}</div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {onDiscussDoc && (
            <button
              type="button"
              onClick={() => onDiscussDoc(doc)}
              title="Discuss or ask question about this document"
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-slate-200 dark:border-zinc-700"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Discuss</span>
            </button>
          )}

          {doc.fileType === 'markdown' ? (
            <button
              type="button"
              onClick={() => onSelectDoc(doc)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Read</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onSelectDoc(doc)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                title="Download PDF"
                className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition active:scale-95 cursor-pointer border border-slate-200 dark:border-zinc-700"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
