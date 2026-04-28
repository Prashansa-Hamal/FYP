export function CartSummarySkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Header Skeleton */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 w-40 bg-white/20 rounded-lg animate-pulse mb-2"></div>
                <div className="h-4 w-56 bg-white/20 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-10 w-24 bg-white/20 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Restaurant Info Bar Skeleton */}
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 p-6">
            {/* Left Column Skeleton */}
            <div className="lg:w-2/3 space-y-6">
              {/* Order Type Badge Skeleton */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              </div>

              {/* Additional Info Card Skeleton */}
              <div className="bg-amber-50/30 rounded-xl border border-amber-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse mt-0.5"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-40 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse mt-0.5"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Card Skeleton */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-5">
                      <div className="flex gap-4">
                        {/* Image Skeleton */}
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl animate-pulse flex-shrink-0"></div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-4 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                            </div>
                            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:w-1/3">
              <div className="sticky top-24">
                <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-xl border border-amber-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-100">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  {/* Price Breakdown Skeleton */}
                  <div className="space-y-3 mb-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                    <div className="pt-2">
                      <div className="flex justify-between items-center">
                        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-7 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Time Skeleton */}
                  <div className="bg-amber-50/80 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Badge Skeleton */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Security Badge Skeleton */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  {/* Action Buttons Skeleton */}
                  <div className="space-y-3">
                    <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>

                  {/* Terms Skeleton */}
                  <div className="flex justify-center gap-1 mt-4">
                    <div className="h-3 w-40 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  {/* Guarantee Skeleton */}
                  <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Help Section Skeleton */}
                <div className="mt-4 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="text-center py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="h-3 w-40 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
