import type { PullRequest, ReviewFinding } from '@/types/review';

export interface FileSummary {
  path: string;
  openCount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  totalCount: number;
}

export function groupFindingsByFile(findings: ReviewFinding[]): FileSummary[] {
  const map = new Map<string, FileSummary>();

  for (const finding of findings) {
    const existing = map.get(finding.file) ?? {
      path: finding.file,
      openCount: 0,
      criticalCount: 0,
      warningCount: 0,
      infoCount: 0,
      totalCount: 0,
    };

    existing.totalCount += 1;
    if (finding.status === 'open') {
      existing.openCount += 1;
      if (finding.severity === 'critical') existing.criticalCount += 1;
      if (finding.severity === 'warning') existing.warningCount += 1;
      if (finding.severity === 'info') existing.infoCount += 1;
    }

    map.set(finding.file, existing);
  }

  return Array.from(map.values()).sort((a, b) => b.openCount - a.openCount || a.path.localeCompare(b.path));
}

export function generateReviewReport(pr: PullRequest, findings: ReviewFinding[]): string {
  const open = findings.filter((f) => f.status === 'open');
  const lines: string[] = [
    `# AI Code Review Report`,
    '',
    `**PR #${pr.id}:** ${pr.title}`,
    `**Author:** ${pr.author}`,
    `**Branch:** \`${pr.branch}\` → \`${pr.baseBranch}\``,
    `**Changes:** +${pr.additions} / −${pr.deletions} across ${pr.filesChanged} files`,
    '',
    `## Summary`,
    '',
    `- ${open.filter((f) => f.severity === 'critical').length} critical`,
    `- ${open.filter((f) => f.severity === 'warning').length} warnings`,
    `- ${open.filter((f) => f.severity === 'info').length} info`,
    `- ${findings.filter((f) => f.status === 'resolved').length} resolved`,
    `- ${findings.filter((f) => f.status === 'dismissed').length} dismissed`,
    '',
  ];

  for (const finding of findings) {
    lines.push(
      `## ${finding.title}`,
      '',
      `- **Severity:** ${finding.severity}`,
      `- **Category:** ${finding.category}`,
      `- **Status:** ${finding.status}`,
      `- **Location:** \`${finding.file}:${finding.lineStart}\``,
      '',
      finding.description,
      '',
      '**Suggestion:**',
      '',
      finding.suggestion,
      '',
    );
  }

  return lines.join('\n');
}
