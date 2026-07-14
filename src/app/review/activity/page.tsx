import { ActivityTimeline } from '@/components/review/ActivityTimeline';
import { mockPullRequest } from '@/data/mockReview';

export default function ActivityPage() {
  const pr = mockPullRequest;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-blue-600 mb-1">Pull Request #{pr.id}</p>
          <h1 className="text-2xl font-bold text-gray-900">Review Activity</h1>
          <p className="text-sm text-gray-500 mt-2">
            Timeline of finding status changes during this review session
          </p>
        </header>

        <ActivityTimeline />
      </div>
    </div>
  );
}
