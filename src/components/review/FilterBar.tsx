import type { CategoryFilter, SeverityFilter, StatusFilter } from '@/types/review';

interface FilterBarProps {
  severity: SeverityFilter;
  category: CategoryFilter;
  status: StatusFilter;
  onSeverityChange: (value: SeverityFilter) => void;
  onCategoryChange: (value: CategoryFilter) => void;
  onStatusChange: (value: StatusFilter) => void;
}

const selectClass =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500';

export function FilterBar({
  severity,
  category,
  status,
  onSeverityChange,
  onCategoryChange,
  onStatusChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        className={selectClass}
        value={severity}
        onChange={(e) => onSeverityChange(e.target.value as SeverityFilter)}
        aria-label="Filter by severity"
      >
        <option value="all">All severities</option>
        <option value="critical">Critical</option>
        <option value="warning">Warning</option>
        <option value="info">Info</option>
      </select>

      <select
        className={selectClass}
        value={category}
        onChange={(e) => onCategoryChange(e.target.value as CategoryFilter)}
        aria-label="Filter by category"
      >
        <option value="all">All categories</option>
        <option value="type-safety">Type Safety</option>
        <option value="performance">Performance</option>
        <option value="best-practice">Best Practice</option>
        <option value="security">Security</option>
        <option value="maintainability">Maintainability</option>
      </select>

      <select
        className={selectClass}
        value={status}
        onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        <option value="open">Open</option>
        <option value="resolved">Resolved</option>
        <option value="dismissed">Dismissed</option>
      </select>
    </div>
  );
}
