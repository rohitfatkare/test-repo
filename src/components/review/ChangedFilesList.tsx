'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { ReviewFinding } from '@/types/review';
import { groupFindingsByFile } from '@/lib/reviewUtils';

interface ChangedFilesListProps {
  findings: ReviewFinding[];
}

function SeverityPill({ count, label, color }: { count: number; label: string; color: string }) {
  if (count === 0) return null;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${color}`}>
      {count} {label}
    </span>
  );
}

export function ChangedFilesList({ findings }: ChangedFilesListProps) {
  const files = useMemo(() => groupFindingsByFile(findings), [findings]);

  if (files.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-gray-500">No files with findings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <article
          key={file.path}
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-200 transition-colors"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <p className="font-mono text-sm font-medium text-gray-900 break-all">{file.path}</p>
              <div className="flex flex-wrap gap-2">
                <SeverityPill count={file.criticalCount} label="critical" color="bg-red-100 text-red-700" />
                <SeverityPill count={file.warningCount} label="warning" color="bg-amber-100 text-amber-700" />
                <SeverityPill count={file.infoCount} label="info" color="bg-blue-100 text-blue-700" />
                {file.openCount === 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-700">
                    All resolved
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right text-sm text-gray-500">
                <p className="font-semibold text-gray-900">{file.openCount} open</p>
                <p>{file.totalCount} total findings</p>
              </div>
              <Link
                href={`/review?file=${encodeURIComponent(file.path)}`}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                View findings
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
