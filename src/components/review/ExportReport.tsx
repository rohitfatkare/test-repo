'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { generateReviewReport } from '@/lib/reviewUtils';
import type { PullRequest, ReviewFinding } from '@/types/review';

interface ExportReportProps {
  pullRequest: PullRequest;
  findings: ReviewFinding[];
}

export function ExportReport({ pullRequest, findings }: ExportReportProps) {
  const [copied, setCopied] = useState(false);

  const report = generateReviewReport(pullRequest, findings);

  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `review-pr-${pullRequest.id}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" className="text-sm" onClick={handleDownload}>
        Download Report
      </Button>
      <Button variant="secondary" className="text-sm" onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy to Clipboard'}
      </Button>
    </div>
  );
}
