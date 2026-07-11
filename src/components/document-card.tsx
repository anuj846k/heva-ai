'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type DocType = 'markdown' | 'html' | 'json' | 'csv';

function CsvTable({ content }: { content: string }) {
  const rows = content.trim().split('\n').map((r) => r.split(','));
  const [header, ...body] = rows;
  return (
    <div className="overflow-auto max-h-64">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            {header.map((cell, i) => (
              <th
                key={i}
                className="border border-border px-2 py-1 bg-muted text-left font-medium"
              >
                {cell.trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className="even:bg-muted/30">
              {row.map((cell, ci) => (
                <td key={ci} className="border border-border px-2 py-1">
                  {cell.trim()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface DocumentCardProps {
  docType: DocType;
  title: string;
  content: string;
}

export function DocumentCard({ docType, title, content }: DocumentCardProps) {
  const badge: Record<DocType, string> = {
    markdown: 'MD',
    html: 'HTML',
    json: 'JSON',
    csv: 'CSV',
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/40 shrink-0">
        <span className="text-[10px] font-mono font-semibold tracking-wider text-muted-foreground">
          {badge[docType]}
        </span>
        <span className="text-sm font-medium truncate">{title}</span>
      </div>

      <div className="flex-1 overflow-auto p-3 flex flex-col min-h-0">
        {docType === 'markdown' && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}

        {docType === 'html' && (
          <iframe
            sandbox="allow-scripts"
            srcDoc={content}
            className="flex-1 w-full rounded border border-border bg-white min-h-[400px]"
            style={{ height: '100%' }}
            title={title}
          />
        )}

        {docType === 'json' && (
          <pre className="text-xs bg-muted rounded p-2 overflow-auto max-h-64 font-mono">
            {(() => {
              try {
                return JSON.stringify(JSON.parse(content), null, 2);
              } catch {
                return content;
              }
            })()}
          </pre>
        )}

        {docType === 'csv' && <CsvTable content={content} />}
      </div>
    </div>
  );
}
