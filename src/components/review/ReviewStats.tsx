import type {
  FindingSeverity,
  ReviewFinding,
  SeverityFilter,
  StatusFilter,
} from '@/types/review';

interface ReviewStatsProps {
  findings: ReviewFinding[];
  severity: SeverityFilter;
  status: StatusFilter;
  onSeverityChange: (value: SeverityFilter) => void;
  onStatusChange: (value: StatusFilter) => void;
}

const severityConfig = {
  critical: { label: 'Critical', color: 'text-red-600 bg-red-50 border-red-200' },
  warning: { label: 'Warnings', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  info: { label: 'Info', color: 'text-blue-600 bg-blue-50 border-blue-200' },
} as const;

const statusItems: Array<{ key: StatusFilter; label: string }> = [
  { key: 'open', label: 'open' },
  { key: 'resolved', label: 'resolved' },
  { key: 'dismissed', label: 'dismissed' },
];

export function ReviewStats({
  findings,
  severity,
  status,
  onSeverityChange,
  onStatusChange,
}: ReviewStatsProps) {
  const openFindings = findings.filter((f) => f.status === 'open');
  const resolvedCount = findings.filter((f) => f.status === 'resolved').length;
  const dismissedCount = findings.filter((f) => f.status === 'dismissed').length;

  const counts: Record<FindingSeverity, number> = {
    critical: openFindings.filter((f) => f.severity === 'critical').length,
    warning: openFindings.filter((f) => f.severity === 'warning').length,
    info: openFindings.filter((f) => f.severity === 'info').length,
  };

  const statusCounts: Record<Exclude<StatusFilter, 'all'>, number> = {
    open: openFindings.length,
    resolved: resolvedCount,
    dismissed: dismissedCount,
  };

  const handleSeverityClick = (value: FindingSeverity) => {
    if (severity === value) {
      onSeverityChange('all');
      return;
    }
    onSeverityChange(value);
    onStatusChange('open');
  };

  const handleStatusClick = (value: Exclude<StatusFilter, 'all'>) => {
    onStatusChange(status === value ? 'all' : value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(severityConfig) as FindingSeverity[]).map((level) => {
          const isActive = severity === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => handleSeverityClick(level)}
              aria-pressed={isActive}
              aria-label={`Filter by ${severityConfig[level].label.toLowerCase()} findings`}
              className={`rounded-lg border p-4 text-center transition-shadow hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${severityConfig[level].color} ${
                isActive ? 'ring-2 ring-blue-500 shadow-sm' : ''
              }`}
            >
              <p className="text-2xl font-bold">{counts[level]}</p>
              <p className="text-sm font-medium">{severityConfig[level].label}</p>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        {statusItems.map(({ key, label }) => {
          const isActive = status === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleStatusClick(key)}
              aria-pressed={isActive}
              className={`rounded-full px-3 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isActive
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {statusCounts[key]} {label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400">Click a stat to filter findings. Click again to clear.</p>
    </div>
  );
}
