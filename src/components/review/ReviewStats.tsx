import type { ReviewFinding } from '@/types/review';

interface ReviewStatsProps {
  findings: ReviewFinding[];
}

const severityConfig = {
  critical: { label: 'Critical', color: 'text-red-600 bg-red-50 border-red-200' },
  warning: { label: 'Warnings', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  info: { label: 'Info', color: 'text-blue-600 bg-blue-50 border-blue-200' },
} as const;

export function ReviewStats({ findings }: ReviewStatsProps) {
  const openFindings = findings.filter((f) => f.status === 'open');
  const resolvedCount = findings.filter((f) => f.status === 'resolved').length;
  const dismissedCount = findings.filter((f) => f.status === 'dismissed').length;

  const counts = {
    critical: openFindings.filter((f) => f.severity === 'critical').length,
    warning: openFindings.filter((f) => f.severity === 'warning').length,
    info: openFindings.filter((f) => f.severity === 'info').length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(severityConfig) as Array<keyof typeof severityConfig>).map((severity) => (
          <div
            key={severity}
            className={`rounded-lg border p-4 text-center ${severityConfig[severity].color}`}
          >
            <p className="text-2xl font-bold">{counts[severity]}</p>
            <p className="text-sm font-medium">{severityConfig[severity].label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-sm text-gray-500">
        <span>{openFindings.length} open</span>
        <span>{resolvedCount} resolved</span>
        <span>{dismissedCount} dismissed</span>
      </div>
    </div>
  );
}
