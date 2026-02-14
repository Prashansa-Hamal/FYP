"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  ChefHat,
  Coffee,
  Wine,
  Flame,
  IceCream,
  Carrot,
  Plus,
} from "lucide-react";
import { useMenuItems } from "@/hooks/useMenuItems";
import {
  ITEM_CATEGORIES,
  ItemCategory,
  PREPARATION_STATIONS,
  PreparationStation,
} from "@/types/enums";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MenuItemCardWaiter } from "@/components/cards/menuItemCardWaiter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Debounce hook for search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function MenuItemsPageWaiter() {
  // Filter states
  const [filters, setFilters] = useState({
    category: undefined as ItemCategory | undefined,
    preparationStation: undefined as PreparationStation | undefined,
    isAvailable: undefined as boolean | undefined,
    isVegetarian: undefined as boolean | undefined,
    isSpicy: undefined as boolean | undefined,
    search: "",
    page: 1,
    limit: 12,
  });

  // Debounced search term (800ms delay)
  const debouncedSearch = useDebounce(filters.search, 800);

  // Actual filters for API call
  const [apiFilters, setApiFilters] = useState(filters);

  // Sync apiFilters when debounced search changes or other filters change
  useEffect(() => {
    setApiFilters((prev) => ({
      ...prev,
      search: debouncedSearch,
      page: 1, // Reset to first page when search changes
    }));
  }, [debouncedSearch]);

  // Sync other filter changes immediately (except search)
  useEffect(() => {
    setApiFilters((prev) => ({
      ...prev,
      category: filters.category,
      preparationStation: filters.preparationStation,
      isAvailable: filters.isAvailable,
      isVegetarian: filters.isVegetarian,
      isSpicy: filters.isSpicy,
      page: filters.page,
      limit: filters.limit,
    }));
  }, [
    filters.category,
    filters.preparationStation,
    filters.isAvailable,
    filters.isVegetarian,
    filters.isSpicy,
    filters.page,
    filters.limit,
  ]);

  const [showFilters, setShowFilters] = useState(false);

  // Fetch data with debounced filters
  const { data, isLoading, error, refetch } = useMenuItems(apiFilters);

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({
        ...prev,
        search: e.target.value,
        // Don't set page to 1 here - it will be handled by the debounce effect
      }));
    },
    [],
  );

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      category: undefined,
      preparationStation: undefined,
      isAvailable: undefined,
      isVegetarian: undefined,
      isSpicy: undefined,
      search: "",
      page: 1,
      limit: 12,
    });
  };

  // Get category icon
  const getCategoryIcon = (category: ItemCategory) => {
    const icons = {
      ["APPETIZER"]: <ChefHat className="w-4 h-4" />,
      ["MAIN_COURSE"]: <Flame className="w-4 h-4" />,
      ["DESSERT"]: <IceCream className="w-4 h-4" />,
      ["BEVERAGE"]: <Coffee className="w-4 h-4" />,
      ["ALCOHOLIC"]: <Wine className="w-4 h-4" />,
      ["SNACK"]: <Carrot className="w-4 h-4" />,
      ["SIDE_DISH"]: <Carrot className="w-4 h-4" />,
    };
    return icons[category] || <ChefHat className="w-4 h-4" />;
  };

  // Get station color
  const getStationColor = (station: PreparationStation) => {
    const colors = {
      ["KITCHEN"]: "bg-blue-100 text-blue-800",
      ["BAR"]: "bg-purple-100 text-purple-800",
      ["DESSERT_STATION"]: "bg-pink-100 text-pink-800",
      ["FRY_STATION"]: "bg-amber-100 text-amber-800",
      ["GRILL_STATION"]: "bg-orange-100 text-orange-800",
    };
    return colors[station] || "bg-gray-100 text-gray-800";
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Loading skeleton
  if (isLoading) {
    return <WaiterDashboardLoadingSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Failed to load menu
          </h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const menuItems = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search menu items... (waits for pause)"
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            {/* Search indicator */}
            {filters.search !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters{" "}
              <span className="text-sm font-medium">
                {showFilters ? "↑" : "↓"}
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-2 ">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <Select
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    category: (value as ItemCategory) || undefined,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-full max-w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>

                    {Object.values(ITEM_CATEGORIES).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Preparation Station Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Station
              </label>
              <Select
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    preparationStation:
                      (value as PreparationStation) || undefined,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-full max-w-48">
                  <SelectValue placeholder="All Stations" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Preparation Stations</SelectLabel>

                    {Object.values(PREPARATION_STATIONS).map((station) => (
                      <SelectItem key={station} value={station}>
                        {station.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>

              <Select
                value={
                  filters.isAvailable === undefined
                    ? "ALL"
                    : filters.isAvailable.toString()
                }
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    isAvailable: value === "ALL" ? undefined : value === "true",
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-full max-w-48">
                  <SelectValue placeholder="All" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Availability</SelectLabel>

                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="true">Available</SelectItem>
                    <SelectItem value="false">Unavailable</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Vegetarian Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary
              </label>

              <Select
                value={
                  filters.isVegetarian === undefined
                    ? "ALL"
                    : filters.isVegetarian.toString()
                }
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    isVegetarian:
                      value === "ALL" ? undefined : value === "true",
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-full max-w-48">
                  <SelectValue placeholder="All" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Availability</SelectLabel>

                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="true">Vegetarian Only</SelectItem>
                    <SelectItem value="false">Non-Vegetarian</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Spicy Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spice Level
              </label>

              <Select
                value={
                  filters.isSpicy === undefined
                    ? "ALL"
                    : String(filters.isSpicy)
                }
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    isSpicy: value === "ALL" ? undefined : value === "true",
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-full max-w-48">
                  <SelectValue placeholder="All" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Spice Level</SelectLabel>

                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="true">Spicy Only</SelectItem>
                    <SelectItem value="false">Mild</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Active Filters Badges */}
        <div className="flex flex-wrap gap-2 my-2">
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
              {getCategoryIcon(filters.category)}
              {filters.category.replace("_", " ")}
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, category: undefined }))
                }
                className="ml-1 hover:text-amber-900"
              >
                ×
              </button>
            </span>
          )}
          {filters.preparationStation && (
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStationColor(
                filters.preparationStation,
              )}`}
            >
              {filters.preparationStation.replace("_", " ")}
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    preparationStation: undefined,
                  }))
                }
                className="ml-1"
              >
                ×
              </button>
            </span>
          )}
          {filters.isAvailable !== undefined && (
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {filters.isAvailable ? "Available" : "Unavailable"}
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, isAvailable: undefined }))
                }
                className="ml-1"
              >
                ×
              </button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Search: "{filters.search}"
              <button
                onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                className="ml-1"
              >
                ×
              </button>
            </span>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto ">
        {/* Rest of the component remains the same */}
        {/* Menu Items Grid */}
        {menuItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No menu items found
            </h3>
            <p className="text-gray-600 mb-6">
              {apiFilters.search
                ? 'No results for "' + apiFilters.search + '"'
                : "Try adjusting your filters or add a new item"}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Refetch
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-4">
              {menuItems.map((item) => (
                <MenuItemCardWaiter key={item.id} {...item} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-xl shadow-lg p-6">
                <div className="text-gray-600">
                  Showing {(apiFilters.page - 1) * apiFilters.limit + 1} to{" "}
                  {Math.min(
                    apiFilters.page * apiFilters.limit,
                    pagination.total,
                  )}{" "}
                  of {pagination.total} items
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={apiFilters.page === 1}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                    }
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, pagination.pages) },
                      (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (apiFilters.page <= 3) {
                          pageNum = i + 1;
                        } else if (apiFilters.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = apiFilters.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() =>
                              setFilters((prev) => ({ ...prev, page: pageNum }))
                            }
                            className={`w-10 h-10 rounded-lg font-medium ${
                              apiFilters.page === pageNum
                                ? "bg-amber-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            } transition-colors`}
                          >
                            {pageNum}
                          </button>
                        );
                      },
                    )}
                  </div>

                  <button
                    disabled={apiFilters.page === pagination.pages}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                    }
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Items per page:</span>
                  <select
                    value={apiFilters.limit}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        limit: parseInt(e.target.value),
                        page: 1,
                      }))
                    }
                    className="px-3 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="12">12</option>
                    <option value="24">24</option>
                    <option value="36">36</option>
                    <option value="48">48</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const WaiterDashboardLoadingSkeleton = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
        </div>

        {/* Menu Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
