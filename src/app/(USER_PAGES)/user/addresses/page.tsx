"use client";

import { useAddresses } from "@/hooks/useAddresses";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressCard } from "@/components/AddressCard";
import { AddressDialog } from "@/components/AddressDialog";
import { useRouter } from "next/navigation";

export default function AddressesPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useAddresses();

  if (isLoading) {
    return <AddressesSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Failed to Load Addresses
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't load your saved addresses. Please try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => refetch()}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const addresses = data?.addresses ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3 sm:hidden">
                  <MapPin className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  My Addresses
                </h1>
                <p className="text-white/90 text-sm">
                  Manage your saved delivery locations
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="font-semibold">{addresses.length}</span>
                  <span className="ml-1 text-sm">
                    {addresses.length === 1 ? "address" : "addresses"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Info Bar */}
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">
                  123 Main Street, Kathmandu
                </span>
                <span className="sm:hidden">Kathmandu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500">•</span>
                <span>Manage your delivery addresses</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {addresses.length === 0 ? (
              <EmptyAddressesState />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {addresses.map((address) => (
                    <AddressCard key={address.id} address={address} />
                  ))}

                  {/* Add New Address Card */}
                  <AddressDialog>
                    <div className="group cursor-pointer rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all duration-200 p-6 min-h-[200px] flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                        <Plus className="h-6 w-6 text-amber-600" />
                      </div>
                      <p className="font-medium text-gray-900">
                        Add New Address
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Save another location
                      </p>
                    </div>
                  </AddressDialog>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="text-center py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">Powered by QR Menu System</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyAddressesState() {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <MapPin className="h-10 w-10 text-amber-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Addresses Yet
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Save your delivery addresses to make checkout faster and easier.
      </p>
      <AddressDialog>
        <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-11 px-6">
          <Plus className="mr-2 h-4 w-4" />
          Add Your First Address
        </Button>
      </AddressDialog>
    </div>
  );
}

// Loading Skeleton
function AddressesSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Header Skeleton */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="h-8 w-32 bg-white/20 rounded-lg animate-pulse mb-2"></div>
                <div className="h-4 w-48 bg-white/20 rounded-lg animate-pulse"></div>
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
              <div className="h-4 w-40 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6 flex justify-end">
              <div className="h-11 w-36 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-100 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex gap-2 pt-3">
                    <div className="h-9 flex-1 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-9 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              ))}
              <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 min-h-[200px] flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse mb-3"></div>
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
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
