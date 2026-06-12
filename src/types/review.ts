export type FindingSeverity = 'critical' | 'warning' | 'info';
export type FindingCategory = 'type-safety' | 'performance' | 'best-practice' | 'security' | 'maintainability';
export type FindingStatus = 'open' | 'resolved' | 'dismissed';

export interface CodeLine {
  lineNumber: number;
  content: string;
  highlighted?: boolean;
}

export interface ReviewFinding {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  category: FindingCategory;
  file: string;
  lineStart: number;
  lineEnd: number;
  suggestion: string;
  codeSnippet: CodeLine[];
  status: FindingStatus;
}

export interface PullRequest {
  id: number;
  title: string;
  author: string;
  branch: string;
  baseBranch: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  createdAt: string;
}

export type SeverityFilter = FindingSeverity | 'all';
export type CategoryFilter = FindingCategory | 'all';
export type StatusFilter = FindingStatus | 'all';
