'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { mockFindings, mockPullRequest } from '@/data/mockReview';
import type {
  CategoryFilter,
  FindingStatus,
  ReviewFinding,
  SeverityFilter,
  StatusFilter,
} from '@/types/review';
import { appendActivity } from '@/lib/activityLog';
import { statusToAction } from '@/types/activity';
import { ExportReport } from './ExportReport';
import { FilterBar } from './FilterBar';
import { FindingCard } from './FindingCard';
import { ReviewStats } from './ReviewStats';
import { SearchInput } from './SearchInput';

interface ReviewDashboardProps {
  initialFileFilter?: string;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function matchesSearch(finding: ReviewFinding, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    finding.title,
    finding.description,
    finding.file,
    finding.category,
    finding.suggestion,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalized);
}

function filterFindings(
  findings: ReviewFinding[],
  severity: SeverityFilter,
  category: CategoryFilter,
  status: StatusFilter,
  search: string,
  file: string | null,
) {
  return findings.filter((finding) => {
    if (file && finding.file !== file) return false;
    if (severity !== 'all' && finding.severity !== severity) return false;
    if (category !== 'all' && finding.category !== category) return false;
    if (status !== 'all' && finding.status !== status) return false;
    if (!matchesSearch(finding, search)) return false;
    return true;
  });
}

export function ReviewDashboard({ initialFileFilter }: ReviewDashboardProps) {
  const [findings, setFindings] = useState<ReviewFinding[]>(mockFindings);
  const [severity, setSeverity] = useState<SeverityFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('open');
  const [search, setSearch] = useState('');
  const [fileFilter, setFileFilter] = useState<string | null>(initialFileFilter ?? null);

  const filteredFindings = useMemo(
    () => filterFindings(findings, severity, category, status, search, fileFilter),
    [findings, severity, category, status, search, fileFilter],
  );

  const handleStatusChange = (id: string, newStatus: FindingStatus) => {
    setFindings((prev) => {
      const finding = prev.find((f) => f.id === id);
      if (finding && finding.status !== newStatus) {
        appendActivity(mockPullRequest.id, {
          findingId: finding.id,
          findingTitle: finding.title,
          file: finding.file,
          severity: finding.severity,
          action: statusToAction(finding.status, newStatus),
          previousStatus: finding.status,
          newStatus,
        });
      }
      return prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f));
    });
  };

  const pr = mockPullRequest;

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Pull Request #{pr.id}</p>
            <h1 className="text-2xl font-bold text-gray-900">{pr.title}</h1>
            <p className="text-sm text-gray-500 mt-2">
              {pr.author} wants to merge{' '}
              <span className="font-mono text-gray-700">{pr.branch}</span> into{' '}
              <span className="font-mono text-gray-700">{pr.baseBranch}</span>
            </p>
          </div>
          <div className="text-right text-sm text-gray-500 space-y-3">
            <ExportReport pullRequest={pr} findings={findings} />
            <div>
              <p>{formatDate(pr.createdAt)}</p>
              <p className="mt-1">
                <span className="text-green-600 font-medium">+{pr.additions}</span>
                {' / '}
                <span className="text-red-600 font-medium">−{pr.deletions}</span>
                {' · '}
                {pr.filesChanged} files
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Summary</h2>
        <ReviewStats findings={findings} />
      </section>

      <section className="space-y-4">
        {fileFilter && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm text-blue-800">
              Showing findings for{' '}
              <span className="font-mono font-medium">{fileFilter}</span>
            </p>
            <div className="flex gap-2">
              <Link
                href="/review/files"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                All files
              </Link>
              <button
                type="button"
                onClick={() => setFileFilter(null)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filter
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            AI Findings
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredFindings.length} shown)
            </span>
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput value={search} onChange={setSearch} />
            <FilterBar
              severity={severity}
              category={category}
              status={status}
              onSeverityChange={setSeverity}
              onCategoryChange={setCategory}
              onStatusChange={setStatus}
            />
          </div>
        </div>

        {filteredFindings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">
              {search.trim()
                ? `No findings match "${search.trim()}".`
                : 'No findings match the current filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFindings.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
