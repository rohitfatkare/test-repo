'use client';

import { Button } from '@/components/Button';
import type { FindingStatus, ReviewFinding } from '@/types/review';
import { CodeSnippet } from './CodeSnippet';

interface FindingCardProps {
  finding: ReviewFinding;
  onStatusChange: (id: string, status: FindingStatus) => void;
}

const severityStyles = {
  critical: 'border-l-red-500 bg-red-50/50',
  warning: 'border-l-amber-500 bg-amber-50/50',
  info: 'border-l-blue-500 bg-blue-50/50',
} as const;

const severityBadge = {
  critical: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
} as const;

const statusBadge = {
  open: 'bg-gray-100 text-gray-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-gray-200 text-gray-500',
} as const;

export function FindingCard({ finding, onStatusChange }: FindingCardProps) {
  const isActionable = finding.status === 'open';

  return (
    <article
      className={`rounded-lg border border-gray-200 border-l-4 p-5 space-y-4 ${severityStyles[finding.severity]} ${finding.status !== 'open' ? 'opacity-70' : ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${severityBadge[finding.severity]}`}>
              {finding.severity}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-700">
              {finding.category}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusBadge[finding.status]}`}>
              {finding.status}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{finding.title}</h3>
          <p className="text-sm text-gray-500">
            {finding.file}:{finding.lineStart}
            {finding.lineEnd !== finding.lineStart ? `–${finding.lineEnd}` : ''}
          </p>
        </div>
        {isActionable && (
          <div className="flex gap-2">
            <Button variant="primary" className="text-sm py-1.5" onClick={() => onStatusChange(finding.id, 'resolved')}>
              Resolve
            </Button>
            <Button variant="secondary" className="text-sm py-1.5" onClick={() => onStatusChange(finding.id, 'dismissed')}>
              Dismiss
            </Button>
          </div>
        )}
        {!isActionable && (
          <Button variant="secondary" className="text-sm py-1.5" onClick={() => onStatusChange(finding.id, 'open')}>
            Reopen
          </Button>
        )}
      </div>

      <p className="text-gray-700 text-sm leading-relaxed">{finding.description}</p>

      <CodeSnippet file={finding.file} lines={finding.codeSnippet} />

      <div className="rounded-lg bg-green-50 border border-green-200 p-3">
        <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-1">Suggestion</p>
        <p className="text-sm text-green-900">{finding.suggestion}</p>
      </div>
    </article>
  );
}
