"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  ChefHat,
  Coffee,
  Wine,
  Flame,
  IceCream,
  Carrot,
  Clock,
  DollarSign,
  Star,
  Trash2,
  Eye,
  EyeOff,
  Edit,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ItemCategory, PreparationStation } from "@/generated/prisma/enums";
import {
  useDeleteMenuItem,
  useMenuItems,
  useToggleMenuItemAvailability,
} from "@/hooks/useMenuItems";

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

export default function MenuItemsPage() {
  const router = useRouter();

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
  const { data, isLoading, error } = useMenuItems(apiFilters);
  const deleteMutation = useDeleteMenuItem();
  const toggleMutation = useToggleMenuItemAvailability();

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({
        ...prev,
        search: e.target.value,
        // Don't set page to 1 here - it will be handled by the debounce effect
      }));
    },
    []
  );

  // Handle delete with error handling
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert("Failed to delete item. Please try again.");
      }
    }
  };

  // Handle toggle availability with error handling
  const handleToggleAvailability = async (
    id: string,
    currentStatus: boolean
  ) => {
    try {
      await toggleMutation.mutateAsync({ id, isAvailable: !currentStatus });
    } catch (error) {
      alert("Failed to update availability. Please try again.");
    }
  };

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
      [ItemCategory.APPETIZER]: <ChefHat className="w-4 h-4" />,
      [ItemCategory.MAIN_COURSE]: <Flame className="w-4 h-4" />,
      [ItemCategory.DESSERT]: <IceCream className="w-4 h-4" />,
      [ItemCategory.BEVERAGE]: <Coffee className="w-4 h-4" />,
      [ItemCategory.ALCOHOLIC]: <Wine className="w-4 h-4" />,
      [ItemCategory.SNACK]: <Carrot className="w-4 h-4" />,
      [ItemCategory.SIDE_DISH]: <Carrot className="w-4 h-4" />,
    };
    return icons[category] || <ChefHat className="w-4 h-4" />;
  };

  // Get station color
  const getStationColor = (station: PreparationStation) => {
    const colors = {
      [PreparationStation.KITCHEN]: "bg-blue-100 text-blue-800",
      [PreparationStation.BAR]: "bg-purple-100 text-purple-800",
      [PreparationStation.DESSERT_STATION]: "bg-pink-100 text-pink-800",
      [PreparationStation.FRY_STATION]: "bg-amber-100 text-amber-800",
      [PreparationStation.GRILL_STATION]: "bg-orange-100 text-orange-800",
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white p-4 md:p-8">
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Restaurant Menu
              </h1>
              <p className="text-amber-100">
                {pagination?.total || 0} delicious items available
              </p>
            </div>
            <button
              onClick={() => router.push("/menu-items/create")}
              className="flex items-center gap-2 px-6 py-3 bg-white text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add New Item
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Filters Section */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
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
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters {showFilters ? "↑" : "↓"}
              </button>

              <button
                onClick={handleResetFilters}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-6 border-t">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: (e.target.value as ItemCategory) || undefined,
                      page: 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All Categories</option>
                  {Object.values(ItemCategory).map((category) => (
                    <option key={category} value={category}>
                      {category.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preparation Station Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Station
                </label>
                <select
                  value={filters.preparationStation || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      preparationStation:
                        (e.target.value as PreparationStation) || undefined,
                      page: 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All Stations</option>
                  {Object.values(PreparationStation).map((station) => (
                    <option key={station} value={station}>
                      {station.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  value={filters.isAvailable?.toString() || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      isAvailable:
                        e.target.value === ""
                          ? undefined
                          : e.target.value === "true",
                      page: 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All</option>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>

              {/* Vegetarian Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary
                </label>
                <select
                  value={filters.isVegetarian?.toString() || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      isVegetarian:
                        e.target.value === ""
                          ? undefined
                          : e.target.value === "true",
                      page: 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All</option>
                  <option value="true">Vegetarian Only</option>
                  <option value="false">Non-Vegetarian</option>
                </select>
              </div>

              {/* Spicy Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spice Level
                </label>
                <select
                  value={filters.isSpicy?.toString() || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      isSpicy:
                        e.target.value === ""
                          ? undefined
                          : e.target.value === "true",
                      page: 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All</option>
                  <option value="true">Spicy Only</option>
                  <option value="false">Mild</option>
                </select>
              </div>
            </div>
          )}

          {/* Active Filters Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
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
                  filters.preparationStation
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
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, search: "" }))
                  }
                  className="ml-1"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

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
              onClick={() => router.push("/menu-items/create")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Item
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
                    !item.isAvailable ? "opacity-75" : ""
                  }`}
                >
                  {/* ... rest of the menu item card code ... */}
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl || "/placeholder.png"}
                        alt={item.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <ChefHat className="w-16 h-16 text-amber-300" />
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {!item.isAvailable && (
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                          SOLD OUT
                        </span>
                      )}
                      {item.isVegetarian && (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                          VEG
                        </span>
                      )}
                      {item.isSpicy && (
                        <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                          🔥 SPICY
                        </span>
                      )}
                    </div>

                    {/* Price Tag */}
                    <div className="absolute bottom-3 right-3">
                      <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
                        <span className="font-bold text-lg text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-xl text-gray-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <span className="text-sm text-gray-600">4.5</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description || "Delicious item from our kitchen"}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {getCategoryIcon(item.category)}
                        {item.category.replace("_", " ")}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs ${getStationColor(
                          item.preparationStation
                        )}`}
                      >
                        {item.preparationStation.replace("_", " ")}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{item.preparationTime} min</span>
                      </div>
                      {item.calories && (
                        <div className="flex items-center gap-1">
                          <span>🔥 {item.calories} cal</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleToggleAvailability(item.id, item.isAvailable)
                        }
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          item.isAvailable
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {item.isAvailable ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Show
                          </>
                        )}
                      </button>

                      <button
                        onClick={() =>
                          router.push(`/menu-items/edit/${item.id}`)
                        }
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-xl shadow-lg p-6">
                <div className="text-gray-600">
                  Showing {(apiFilters.page - 1) * apiFilters.limit + 1} to{" "}
                  {Math.min(
                    apiFilters.page * apiFilters.limit,
                    pagination.total
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
                      }
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

        {/* Quick Stats */}
        {menuItems.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pagination?.total || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ChefHat className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {menuItems.filter((item) => item.isAvailable).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vegetarian</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {menuItems.filter((item) => item.isVegetarian).length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Carrot className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(
                      menuItems.reduce((sum, item) => sum + item.price, 0) /
                        menuItems.length
                    )}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
