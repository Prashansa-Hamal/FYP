// components/cart/CartSummarySkeleton.tsx
export function CartSummarySkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="w-32 h-6 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="w-40 h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column Skeleton */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                  <div className="w-48 h-8 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-64 h-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div className="w-24 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
              </div>

              {/* Items Skeleton */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start p-4 border rounded-xl"
                  >
                    <div className="w-20 h-20 bg-gray-300 rounded-lg animate-pulse"></div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-2">
                          <div className="w-40 h-5 bg-gray-300 rounded animate-pulse"></div>
                          <div className="w-24 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                        </div>
                        <div className="w-20 h-6 bg-gray-300 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-32 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                        <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <div className="w-40 h-7 bg-gray-300 rounded animate-pulse mb-6"></div>

              {/* Price Breakdown Skeleton */}
              <div className="space-y-3 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="w-32 h-4 bg-gray-300 rounded animate-pulse"></div>
                    <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>

              {/* Buttons Skeleton */}
              <div className="space-y-3">
                <div className="w-full h-12 bg-gray-300 rounded-xl animate-pulse"></div>
                <div className="w-full h-12 bg-gray-300 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
