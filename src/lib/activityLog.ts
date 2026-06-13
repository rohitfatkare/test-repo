import type { ActivityEntry } from '@/types/activity';

const storageKey = (prId: number) => `ai-review-activity-pr-${prId}`;

export function getActivityLog(prId: number): ActivityEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(storageKey(prId));
    if (!raw) return [];
    return JSON.parse(raw) as ActivityEntry[];
  } catch {
    return [];
  }
}

export function appendActivity(
  prId: number,
  entry: Omit<ActivityEntry, 'id' | 'timestamp'>,
): ActivityEntry {
  const full: ActivityEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  const existing = getActivityLog(prId);
  localStorage.setItem(storageKey(prId), JSON.stringify([full, ...existing]));
  return full;
}

export function clearActivityLog(prId: number): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(storageKey(prId));
}
