import type { FindingSeverity, FindingStatus } from '@/types/review';

export type ActivityAction = 'resolved' | 'dismissed' | 'reopened';

export interface ActivityEntry {
  id: string;
  findingId: string;
  findingTitle: string;
  file: string;
  severity: FindingSeverity;
  action: ActivityAction;
  previousStatus: FindingStatus;
  newStatus: FindingStatus;
  timestamp: string;
}

export function statusToAction(
  previousStatus: FindingStatus,
  newStatus: FindingStatus,
): ActivityAction {
  if (newStatus === 'resolved') return 'resolved';
  if (newStatus === 'dismissed') return 'dismissed';
  return 'reopened';
}
