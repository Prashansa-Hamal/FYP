import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function AddressesSkeleton() {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header Skeleton */}
      <div className="mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <Skeleton className="h-8 w-48 sm:h-10 sm:w-64 mb-2" />
            <Skeleton className="h-4 w-32 sm:h-5 sm:w-40" />
          </div>
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>
        <Skeleton className="h-px w-full" />
      </div>

      {/* Stats Skeleton */}
      <div className="mb-6 sm:mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-7 w-12" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Address Grid Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex gap-2 mt-6">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
