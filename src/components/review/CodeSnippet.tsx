import type { CodeLine } from '@/types/review';

interface CodeSnippetProps {
  file: string;
  lines: CodeLine[];
}

export function CodeSnippet({ file, lines }: CodeSnippetProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-900 text-sm">
      <div className="px-4 py-2 bg-gray-800 text-gray-400 text-xs font-mono border-b border-gray-700">
        {file}
      </div>
      <pre className="p-4 overflow-x-auto font-mono leading-relaxed">
        {lines.map((line) => (
          <div
            key={line.lineNumber}
            className={`flex ${line.highlighted ? 'bg-red-900/40 -mx-4 px-4 border-l-2 border-red-500' : ''}`}
          >
            <span className="select-none w-8 shrink-0 text-gray-500 text-right pr-4">
              {line.lineNumber}
            </span>
            <code className={`${line.highlighted ? 'text-red-300' : 'text-gray-300'}`}>
              {line.content || ' '}
            </code>
          </div>
        ))}
      </pre>
    </div>
  );
}
