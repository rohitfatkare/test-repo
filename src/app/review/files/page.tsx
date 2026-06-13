'use client';

import { ChangedFilesList } from '@/components/review/ChangedFilesList';
import { mockFindings, mockPullRequest } from '@/data/mockReview';
import { useState } from 'react';
import type { ReviewFinding } from '@/types/review';

export default function ChangedFilesPage() {
  const [findings] = useState<ReviewFinding[]>(mockFindings);
  const pr = mockPullRequest;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-blue-600 mb-1">Pull Request #{pr.id}</p>
          <h1 className="text-2xl font-bold text-gray-900">Changed Files</h1>
          <p className="text-sm text-gray-500 mt-2">
            {pr.filesChanged} files changed · click a file to jump to its findings in the dashboard
          </p>
        </header>

        <ChangedFilesList findings={findings} />
      </div>
    </div>
  );
}
