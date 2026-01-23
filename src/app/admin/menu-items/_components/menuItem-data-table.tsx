"use client";
import { DataTable } from "@/components/data-table";
import { AnimatedSkeletonDataTable } from "@/components/skeletons/tableSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MenuItem,
  ItemCategory,
  PreparationStation,
} from "@/generated/prisma/client";
import { useMenuItems } from "@/hooks/useMenuItems";
import { ColumnDef, FilterFn, Row } from "@tanstack/react-table";
import { Edit, Eye, Filter, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Custom filter functions
const multiColumnFilterFn: FilterFn<MenuItem> = (row, filterValue) => {
  const searchableContent =
    `${row.original.name} ${row.original.description}`.toLowerCase();
  return searchableContent.includes(filterValue.toLowerCase());
};

const genericFilterFn: FilterFn<MenuItem> = (
  row,
  columnId,
  filterValue: (boolean | string)[],
) => {
  if (!filterValue?.length) return true;
  return filterValue.includes(row.getValue(columnId));
};

const menuColumns: ColumnDef<MenuItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="font-medium">
        <Link
          href={`/admin/menu-items/${row.original.id}`}
          className="line-clamp-1 flex items-center gap-1"
        >
          {row.getValue("name")}
        </Link>
      </div>
    ),
    size: 320,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Price",
    accessorKey: "price",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("price")}</div>
    ),
    size: 220,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Category",
    accessorKey: "category",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("category")}</div>
    ),
    size: 120,
    filterFn: genericFilterFn,
  },
  {
    header: "Station",
    accessorKey: "preparationStation",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("preparationStation")}</div>
    ),
    size: 120,
    filterFn: genericFilterFn,
  },
  {
    header: "Vegetarian",
    accessorKey: "isVegetarian",
    cell: ({ row }) => (
      <Badge variant={row.getValue("isVegetarian") ? "default" : "outline"}>
        {row.getValue("isVegetarian") ? "Veg" : "Non-Veg"}
      </Badge>
    ),
    size: 120,
  },
  {
    header: "Spicy",
    accessorKey: "isSpicy",
    cell: ({ row }) => (
      <Badge variant={row.getValue("isVegetarian") ? "default" : "outline"}>
        {row.getValue("isVegetarian") ? "Spicy" : "Non-Spicy"}
      </Badge>
    ),
    size: 120,
  },
  {
    header: "Alcoholic",
    accessorKey: "isAlcoholic",
    cell: ({ row }) => (
      <Badge variant={row.getValue("isVegetarian") ? "default" : "outline"}>
        {row.getValue("isVegetarian") ? "Alcoholic" : "Non-Alcoholic"}
      </Badge>
    ),
    size: 120,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 60,
    enableHiding: false,
  },
];

const MenuItemDataTable = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";

  // Get category and station filters from URL
  const categoryParam = searchParams.get("category") || "";
  const stationParam = searchParams.get("preparationStation") || "";
  const categories = categoryParam
    ? (categoryParam.split(",").filter(Boolean) as ItemCategory[])
    : [];
  const stations = stationParam
    ? (stationParam.split(",").filter(Boolean) as PreparationStation[])
    : [];

  // Build filters for the query
  const filters = {
    page,
    limit,
    search: search || undefined,
    category: categories.length > 0 ? (categories.join(",") as any) : undefined,
    preparationStation:
      stations.length > 0 ? (stations.join(",") as any) : undefined,
  };

  const { data: MenuItems, isLoading } = useMenuItems(filters);

  const totalCount = MenuItems?.pagination?.total || 0;
  const totalPages = MenuItems?.pagination?.pages || 1;

  // Helper function to update URL with filters
  const updateUrlWithFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Always reset to page 1 when filters change
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle pagination change
  const handlePaginationChange = ({
    pageIndex,
    pageSize,
  }: {
    pageIndex: number;
    pageSize: number;
  }) => {
    updateUrlWithFilters({
      page: (pageIndex + 1).toString(),
      limit: pageSize.toString(),
    });
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    updateUrlWithFilters({ search: value || null });
  };

  // Handle category filter change
  const handleCategoryFilterChange = (selectedCategories: ItemCategory[]) => {
    updateUrlWithFilters({
      category:
        selectedCategories.length > 0 ? selectedCategories.join(",") : null,
    });
  };

  // Handle station filter change
  const handleStationFilterChange = (
    selectedStations: PreparationStation[],
  ) => {
    updateUrlWithFilters({
      preparationStation:
        selectedStations.length > 0 ? selectedStations.join(",") : null,
    });
  };

  // Handle individual category toggle
  const handleCategoryToggle = (category: ItemCategory) => {
    const newCategories = categories.includes(category)
      ? categories.filter((c) => c !== category)
      : [...categories, category];

    handleCategoryFilterChange(newCategories);
  };

  // Handle individual station toggle
  const handleStationToggle = (station: PreparationStation) => {
    const newStations = stations.includes(station)
      ? stations.filter((s) => s !== station)
      : [...stations, station];

    handleStationFilterChange(newStations);
  };

  // Clear all filters
  const clearAllFilters = () => {
    updateUrlWithFilters({
      search: null,
      category: null,
      preparationStation: null,
      page: "1",
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    search || categories.length > 0 || stations.length > 0;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <AnimatedSkeletonDataTable
          columnCount={5}
          rowCount={8}
          showToolbar={true}
          showPagination={true}
        />
      </div>
    );
  }

  return (
    <DataTable
      data={MenuItems?.data || []}
      columns={menuColumns}
      addButton={{
        href: "/admin/menu-items/new",
        label: "Add Menu Item",
      }}
      // Pagination
      manualPagination={true}
      pageCount={totalPages}
      totalCount={totalCount}
      onPaginationChange={handlePaginationChange}
      // Search/Filtering
      manualFiltering={true}
      searchValue={search}
      onSearchChange={handleSearchChange}
      searchDebounceDelay={500}
      // Initial state
      initialState={{
        pagination: {
          pageIndex: page - 1,
          pageSize: limit,
        },
      }}
      defaultSortColumn="name"
      renderToolbar={() => (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            <CategoryFilter
              selectedCategories={categories}
              onCategoryToggle={handleCategoryToggle}
            />

            {/* Station Filter */}
            <StationFilter
              selectedStations={stations}
              onStationToggle={handleStationToggle}
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    />
  );
};

export default MenuItemDataTable;

const RowActions = ({ row }: { row: Row<MenuItem> }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" type="button">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Edit className="h-4 w-4 mr-2" />
          Edit Item
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Eye className="h-4 w-4 mr-2" />
          Mark Available
        </DropdownMenuItem>

        <Separator className="my-1" />
        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
          <Trash2 className="h-4 w-4 mr-2" color="red" />
          Delete Item
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Separate filter components
interface CategoryFilterProps {
  selectedCategories: ItemCategory[];
  onCategoryToggle: (category: ItemCategory) => void;
}

const CategoryFilter = ({
  selectedCategories,
  onCategoryToggle,
}: CategoryFilterProps) => {
  const categoryValues: ItemCategory[] = [
    "APPETIZER",
    "MAIN_COURSE",
    "DESSERT",
    "BEVERAGE",
    "ALCOHOLIC",
    "SNACK",
    "SIDE_DISH",
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4 capitalize" />
          Category
          {selectedCategories.length > 0 && (
            <span className="ml-2 h-5 rounded bg-primary/10 px-1.5 text-xs font-medium">
              {selectedCategories.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" align="start">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Filter by category
          </div>
          {categoryValues.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => onCategoryToggle(category)}
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm font-normal cursor-pointer"
              >
                {category.replace(/_/g, " ")}
              </Label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface StationFilterProps {
  selectedStations: PreparationStation[];
  onStationToggle: (station: PreparationStation) => void;
}

const StationFilter = ({
  selectedStations,
  onStationToggle,
}: StationFilterProps) => {
  const stationValues: PreparationStation[] = [
    "KITCHEN",
    "BAR",
    "DESSERT_STATION",
    "FRY_STATION",
    "GRILL_STATION",
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4 capitalize" />
          Station
          {selectedStations.length > 0 && (
            <span className="ml-2 h-5 rounded bg-primary/10 px-1.5 text-xs font-medium">
              {selectedStations.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" align="start">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Filter by station
          </div>
          {stationValues.map((station) => (
            <div key={station} className="flex items-center space-x-2">
              <Checkbox
                id={`station-${station}`}
                checked={selectedStations.includes(station)}
                onCheckedChange={() => onStationToggle(station)}
              />
              <Label
                htmlFor={`station-${station}`}
                className="text-sm font-normal cursor-pointer"
              >
                {station.replace(/_/g, " ")}
              </Label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
