import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function CartPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>

        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Content */}
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Cart Items */}
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-xl">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <Skeleton className="h-24 w-24 rounded-lg" />

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between">
                    {/* Top */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>

                    {/* Bottom */}
                    <div className="mt-4 flex items-center justify-between">
                      {/* Quantity */}
                      <Skeleton className="h-9 w-28 rounded-lg" />

                      {/* Price */}
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <Card className="sticky top-24 rounded-xl">
          <CardContent className="p-6 space-y-6">
            <Skeleton className="h-6 w-36" />

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}

              <div className="h-px w-full bg-muted" />

              <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 p-6 pt-0">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-4 w-32" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
