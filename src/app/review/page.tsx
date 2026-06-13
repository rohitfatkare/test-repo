import { ReviewDashboard } from '@/components/review/ReviewDashboard';

interface ReviewPageProps {
  searchParams: Promise<{ file?: string }>;
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <ReviewDashboard initialFileFilter={params.file} />
      </div>
    </div>
  );
}
