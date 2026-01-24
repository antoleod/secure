import { Skeleton } from './ui/skeleton';

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <div className="container mx-auto px-6 py-10 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <Skeleton className="h-52 rounded-3xl" />
          <Skeleton className="h-52 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
