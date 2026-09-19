import React from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownContentRendererProps {
  content: string;
  copiedCodeIndex: number | null;
  onCopyCode: (code: string, index: number) => void;
}

export const MarkdownContentRenderer: React.FC<MarkdownContentRendererProps> = ({
  content = '',
  copiedCodeIndex,
  onCopyCode,
}) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLanguage = '';
  let currentCode: string[] = [];
  let codeBlockCount = 0;
  let tableRows: string[][] = [];

  const flushTable = (keyPrefix: string) => {
    if (tableRows.length > 0) {
      const headers = tableRows[0];
      const dataRows = tableRows.slice(1).filter((r) => !r.every((c) => c.trim().startsWith('-')));

      elements.push(
        <div key={`table-${keyPrefix}`} className="overflow-x-auto my-5 rounded-xl border border-zinc-200 no-scrollbar shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-100 text-zinc-900">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="py-2.5 px-4 font-bold border-b border-zinc-200">
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-zinc-50 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2 px-4 text-zinc-800">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
  };

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        flushTable(`before-code-${idx}`);
        inCodeBlock = true;
        codeLanguage = line.trim().replace('```', '') || 'code';
        currentCode = [];
      } else {
        const fullCode = currentCode.join('\n');
        const currentIndex = codeBlockCount++;

        elements.push(
          <div key={`code-${idx}`} className="my-5 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-950 shadow-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400">
              <span className="font-mono uppercase font-bold text-zinc-200">{codeLanguage}</span>
              <button
                onClick={() => onCopyCode(fullCode, currentIndex)}
                className="flex items-center gap-1 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                {copiedCodeIndex === currentIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy snippet</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed no-scrollbar">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        currentCode = [];
      }
      return;
    }

    if (inCodeBlock) {
      currentCode.push(line);
      return;
    }

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.split('|').slice(1, -1);
      tableRows.push(cells);
      return;
    } else {
      flushTable(`row-${idx}`);
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={idx} className="text-xl sm:text-2xl font-black text-zinc-950 mt-6 mb-3 tracking-tight">
          {line.replace('# ', '')}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={idx} className="text-base sm:text-lg font-bold text-zinc-900 mt-5 mb-2">
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="text-sm font-semibold text-zinc-800 mt-4 mb-2">
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={idx} className="text-xs sm:text-sm text-zinc-700 ml-4 list-disc my-1 leading-relaxed">
          {line.replace(/^[-*]\s+/, '')}
        </li>
      );
    } else if (line.trim()) {
      elements.push(
        <p key={idx} className="text-xs sm:text-sm text-zinc-800 leading-relaxed my-2">
          {line}
        </p>
      );
    }
  });

  flushTable('end');
  return <div className="space-y-1">{elements}</div>;
};
