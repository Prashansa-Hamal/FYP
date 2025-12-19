"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  MapPin,
  Phone,
  Wifi,
  Search,
  ArrowLeft,
  Clock,
  AlertCircle,
  ChefHat,
} from "lucide-react";
import { MenuCategoryCard } from "@/components/cards/MenuCategoryCard";
import MenuCategories from "@/json/menuCategories.json";
import { useMenuItems } from "@/hooks/useMenuItems";
import { ItemCategory } from "@/generated/prisma/enums";
import { MenuItemCard } from "@/components/cards/MenuItemCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Custom hook for debounce
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// Filter state interface
interface FilterState {
  category?: ItemCategory;
  isAvailable?: boolean;
  search: string;
  page: number;
  limit: number;
}

// Main component
export default function App() {
  // Combined state for better performance
  const [state, setState] = useState<{
    isVisible: boolean;
    filters: FilterState;
    showSearchResults: boolean;
  }>({
    isVisible: false,
    showSearchResults: false,
    filters: {
      search: "",
      page: 1,
      limit: 12,
      category: undefined,
    },
  });

  // Debounced search term
  const debouncedSearch = useDebounce(state.filters.search, 300);

  // Memoized API filters to prevent unnecessary recalculations
  const apiFilters = useMemo(() => {
    const { search, ...restFilters } = state.filters;
    return {
      ...restFilters,
      search: debouncedSearch,
      page: debouncedSearch !== state.filters.search ? 1 : state.filters.page,
    };
  }, [state.filters, debouncedSearch]);

  // Handle search visibility with timeout cleanup
  useEffect(() => {
    const hasSearch = debouncedSearch.trim().length > 0;

    if (hasSearch !== state.showSearchResults) {
      const timer = setTimeout(
        () => {
          setState((prev) => ({
            ...prev,
            showSearchResults: hasSearch,
            isVisible: hasSearch || !!state.filters.category,
          }));
        },
        hasSearch ? 100 : 0
      );

      return () => clearTimeout(timer);
    }
  }, [debouncedSearch, state.filters.category]);

  // Fetch menu items
  const { data, isLoading, error } = useMenuItems(apiFilters);

  // Memoized menu items
  const menuItems = useMemo(() => data?.data || [], [data]);

  // Event handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setState((prev) => ({
        ...prev,
        filters: {
          ...prev.filters,
          search: value,
        },
      }));
    },
    []
  );

  const handleSelectCategory = useCallback((category: ItemCategory) => {
    setState((prev) => ({
      ...prev,
      isVisible: true,
      filters: {
        ...prev.filters,
        category,
        page: 1,
      },
    }));
  }, []);

  const handleBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isVisible: false,
      showSearchResults: false,
      filters: {
        ...prev.filters,
        category: undefined,
        search: "",
      },
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isVisible: false,
      showSearchResults: false,
      filters: {
        search: "",
        page: 1,
        limit: 12,
        category: undefined,
      },
    }));
  }, []);

  // Loading state component
  const LoadingState = () => (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
      <div className="relative mb-6">
        <div className="w-20 h-20 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
        <ChefHat className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-amber-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Preparing Your Menu
      </h3>
      <p className="text-gray-600 text-center max-w-sm">
        Loading our culinary delights...
      </p>
      <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
        <Clock className="w-4 h-4 animate-pulse" />
        <span>Just a moment</span>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="min-h-[400px] bg-gradient-to-b from-red-50/50 to-white rounded-2xl flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        Unable to Load Menu
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {error?.message ||
          "We're having trouble loading the menu. Please check your connection."}
      </p>
      <div className="flex gap-3">
        <Button
          onClick={() => window.location.reload()}
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Try Again
        </Button>
        <Button
          onClick={resetFilters}
          variant="outline"
          className="border-gray-300 text-gray-700 px-6 py-2 rounded-lg"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <ChefHat className="w-12 h-12 text-amber-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">No Items Found</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {apiFilters.search
          ? `No results found for "${apiFilters.search}"`
          : "Try selecting a different category or adjusting your filters"}
      </p>
      <Button
        onClick={resetFilters}
        variant="outline"
        className="border-amber-200 text-amber-600 hover:bg-amber-50"
      >
        View All Categories
      </Button>
    </div>
  );

  // Main render
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white p-4">
        <div className="max-w-xl mx-auto">
          <ErrorState />
        </div>
      </div>
    );
  }

  const shouldShowMenuItems = state.isVisible || state.showSearchResults;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4 sm:pt-0">
      <div className="max-w-xl mx-auto relative">
        <div className="absolute min-h-svh h-full">
          {shouldShowMenuItems && (
            <Button
              onClick={handleBack}
              className="sticky top-3 ml-3 z-50 left-3 bg-white/40 hover:bg-white backdrop-blur-sm  rounded-full h-10 w-10 shadow-lg transition-all duration-200"
              aria-label="Go back to categories"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
          )}
        </div>
        <div className="bg-white rounded-2xl sm:rounded-t-none shadow-xl overflow-hidden">
          {/* Hero Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1756397481872-ed981ef72a51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcmVzdGF1cmFudCUyMGludGVyaW9yfGVufDF8fHx8MTc2NjEyMDA0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Restaurant interior"
              className="w-full h-[220px] object-cover"
              loading="eager"
            />
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Title */}
            <div className="text-center mb-4 sm:mb-6">
              <h1 className="mb-1 text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 sm:mb-2">
                Culinary Delights Menu
              </h1>
              <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
                Discover our carefully curated selection of dishes and beverages
              </p>
            </div>

            {/* Restaurant Info */}
            <div className="bg-gray-50/80 rounded-xl p-4 mb-4 sm:mb-6 backdrop-blur-sm">
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 flex-shrink-0 text-[#f08167]" />
                  <span className="text-sm sm:text-base">
                    123 Main Street, Kathmandu, Nepal
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5 flex-shrink-0 text-[#f08167]" />
                  <span className="text-sm sm:text-base">+977 9801234567</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Wifi className="w-5 h-5 flex-shrink-0 text-[#f08167]" />
                  <span className="text-sm sm:text-base">WiFi_Password123</span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto sm:mb-8 mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search dishes or categories..."
                  value={state.filters.search}
                  onChange={handleSearchChange}
                  className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 sm:px-5 py-3 sm:py-4 pr-12 text-sm sm:text-base outline-none focus:border-[#f08167] focus:ring-2 focus:ring-[#f08167]/20 transition-all duration-200 placeholder:text-gray-400 backdrop-blur-sm"
                  aria-label="Search menu items"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              {/* Search hint */}
              {debouncedSearch && (
                <div className="mt-2 px-1">
                  <p className="text-sm text-gray-500 text-center animate-fadeIn">
                    Searching for:{" "}
                    <span className="font-medium text-[#f08167]">
                      {debouncedSearch}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Content Sections */}
            {isLoading ? (
              <LoadingState />
            ) : (
              <>
                {/* Menu Categories (Visible when not searching/showing items) */}
                <div
                  className={cn(
                    "transition-all duration-300 ease-in-out",
                    shouldShowMenuItems
                      ? "opacity-0 max-h-0 overflow-hidden"
                      : "opacity-100 max-h-[2000px]"
                  )}
                >
                  <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
                    {MenuCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() =>
                          handleSelectCategory(category.type as ItemCategory)
                        }
                        className="text-left w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        aria-label={`View category`}
                      >
                        <MenuCategoryCard {...category} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu Items (Visible when searching or category selected) */}
                <div
                  className={cn(
                    "transition-all duration-300 ease-in-out",
                    shouldShowMenuItems
                      ? "opacity-100 max-h-[5000px]"
                      : "opacity-0 max-h-0 overflow-hidden"
                  )}
                >
                  {/* Category Header */}
                  {state.filters.category && !state.showSearchResults && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 capitalize mb-2">
                        {state.filters.category
                          .replace(/_/g, " ")
                          .toLowerCase()}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {menuItems.length} items available
                      </p>
                    </div>
                  )}

                  {/* Menu Items Grid or Empty State */}
                  {menuItems.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {menuItems.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          {...item}
                          //   className="animate-fadeInUp"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Footer */}
            <div className="text-center mt-6 sm:mt-10 pt-4 sm:pt-6 border-t border-gray-200/50">
              <p className="text-xs sm:text-sm text-gray-400">
                Powered by QR Menu System{" "}
                {state.isVisible
                  ? `${isLoading ? "" : `• ${menuItems.length} items loaded`}`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
