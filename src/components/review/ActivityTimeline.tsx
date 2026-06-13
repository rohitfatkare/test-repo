'use client';

import { useEffect, useState } from 'react';
import { clearActivityLog, getActivityLog } from '@/lib/activityLog';
import { mockPullRequest } from '@/data/mockReview';
import type { ActivityEntry } from '@/types/activity';
import { Button } from '@/components/Button';

const actionConfig = {
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  dismissed: { label: 'Dismissed', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  reopened: { label: 'Reopened', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
} as const;

const severityBadge = {
  critical: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
} as const;

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso));
}

export function ActivityTimeline() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const prId = mockPullRequest.id;

  useEffect(() => {
    setEntries(getActivityLog(prId));
  }, [prId]);

  const handleClear = () => {
    clearActivityLog(prId);
    setEntries([]);
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-gray-500">No review activity yet.</p>
        <p className="text-sm text-gray-400 mt-2">
          Resolve, dismiss, or reopen findings on the dashboard to build a timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="secondary" className="text-sm" onClick={handleClear}>
          Clear history
        </Button>
      </div>

      <ol className="relative border-l border-gray-200 ml-3 space-y-6">
        {entries.map((entry) => {
          const config = actionConfig[entry.action];
          return (
            <li key={entry.id} className="ml-6">
              <span
                className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full ring-4 ring-white ${config.dot}`}
              />
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${config.color}`}>
                    {config.label}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${severityBadge[entry.severity]}`}>
                    {entry.severity}
                  </span>
                  <time className="text-xs text-gray-400 ml-auto">{formatTimestamp(entry.timestamp)}</time>
                </div>
                <p className="font-medium text-gray-900">{entry.findingTitle}</p>
                <p className="text-sm text-gray-500 font-mono mt-1">{entry.file}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {entry.previousStatus} → {entry.newStatus}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
