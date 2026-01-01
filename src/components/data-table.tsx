// components/ui/data-table.tsx
"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleX,
  Columns3,
  ListFilter,
  Plus,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState, useEffect, useCallback } from "react";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  pageSizeOptions?: number[];
  addButton?: {
    href: string;
    label: string;
  };
  renderToolbar?: (
    table: ReturnType<typeof useReactTable<TData>>
  ) => React.ReactNode;
  // Pagination props
  manualPagination?: boolean;
  pageCount?: number;
  totalCount?: number;
  onPaginationChange?: (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => void;
  // Filtering props
  manualFiltering?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchDebounceDelay?: number;
  // Initial state
  initialState?: {
    pagination?: PaginationState;
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
  };
}

export function DataTable<TData>({
  data,
  columns,
  addButton,
  pageSizeOptions = [5, 10, 25, 50],
  renderToolbar,
  // Pagination
  manualPagination = false,
  pageCount = -1,
  totalCount,
  onPaginationChange,
  // Filtering
  manualFiltering = false,
  searchValue: externalSearchValue,
  onSearchChange,
  searchDebounceDelay = 500,
  // Initial state
  initialState = {},
}: DataTableProps<TData>) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Local search state with debouncing
  const [localSearch, setLocalSearch] = useState(externalSearchValue || "");
  const debouncedSearch = useDebounce(localSearch, searchDebounceDelay);

  // Initialize states
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialState.columnFilters || []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>(
    initialState.pagination || {
      pageIndex: 0,
      pageSize: pageSizeOptions[1] || 10,
    }
  );
  const [sorting, setSorting] = useState<SortingState>(
    initialState.sorting || [{ id: "name", desc: false }]
  );

  // Sync external search value
  useEffect(() => {
    if (
      externalSearchValue !== undefined &&
      externalSearchValue !== localSearch
    ) {
      setLocalSearch(externalSearchValue);
    }
  }, [externalSearchValue]);

  // When debounced search changes, notify parent
  useEffect(() => {
    if (
      manualFiltering &&
      onSearchChange &&
      debouncedSearch !== externalSearchValue
    ) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, manualFiltering, onSearchChange, externalSearchValue]);

  const table = useReactTable({
    data,
    columns,
    // Control what features are manual vs automatic
    manualPagination,
    manualFiltering,
    // Set page count
    pageCount:
      pageCount === -1
        ? Math.ceil((totalCount || data.length) / pagination.pageSize)
        : pageCount,
    // State
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
    // State updaters
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      const newFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      setColumnFilters(newFilters);
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function" ? updater(pagination) : updater;

      setPagination(newPagination);

      if (onPaginationChange) {
        onPaginationChange(newPagination);
      }
    },
    // Core models (only enable client-side models when not manual)
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: manualFiltering
      ? undefined
      : getFacetedUniqueValues(),
  });

  // Handle search input
  const handleSearchChange = (value: string) => {
    setLocalSearch(value);

    // Update table filter for UI consistency
    table.getColumn("name")?.setFilterValue(value);

    if (!manualFiltering) {
      // For client-side filtering
      // Reset to page 1 when searching locally
      if (manualPagination && onPaginationChange) {
        onPaginationChange({
          pageIndex: 0,
          pageSize: pagination.pageSize,
        });
      }
    }
  };

  const handleSearchClear = () => {
    handleSearchChange("");
  };

  // Calculate display values
  const currentPage = pagination.pageIndex;
  const currentPageSize = pagination.pageSize;
  const startItem =
    totalCount && totalCount > 0 ? currentPage * currentPageSize + 1 : 0;
  const endItem = Math.min(
    (currentPage + 1) * currentPageSize,
    totalCount || data.length
  );
  const displayTotalCount = totalCount || data.length;

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value);
    const firstItemIndex = currentPage * currentPageSize;
    const newPageIndex = Math.floor(firstItemIndex / newPageSize);

    const newPagination = {
      pageIndex: newPageIndex,
      pageSize: newPageSize,
    };

    setPagination(newPagination);

    if (onPaginationChange) {
      onPaginationChange(newPagination);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input with debouncing */}
          <div className="relative">
            <Input
              ref={inputRef}
              className={cn("peer min-w-60 ps-9", localSearch && "pe-9")}
              placeholder="Search by name, description, or tags..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
              <ListFilter className="h-4 w-4 opacity-50" />
            </div>
            {localSearch && (
              <button
                onClick={handleSearchClear}
                className="absolute inset-y-0 end-0 flex items-center pe-3 hover:bg-gray-100 rounded-sm"
                type="button"
                aria-label="Clear search"
              >
                <CircleX className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          {/* Toolbar actions */}
          <div className="flex flex-wrap gap-3">
            {renderToolbar?.(table)}
            {/* Column Visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Columns3 className="mr-2 h-4 w-4" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Add Button and Actions */}
        <div className="flex items-center justify-end gap-3">
          {table.getSelectedRowModel().rows.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Selected ({table.getSelectedRowModel().rows.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                {/* Delete confirmation dialog */}
              </AlertDialogContent>
            </AlertDialog>
          )}
          {addButton && (
            <Link href={addButton?.href as string}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {addButton?.label}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg w-full border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className="h-11"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              "flex h-full cursor-pointer select-none items-center justify-between gap-2"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (
                              header.column.getCanSort() &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: (
                              <ChevronUp
                                className="shrink-0 opacity-60"
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ChevronDown
                                className="shrink-0 opacity-60"
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {localSearch
                    ? "No results found for your search."
                    : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-8">
        {/* Results per page */}
        <div className="flex items-center gap-3">
          <Label htmlFor={id} className="max-sm:sr-only">
            Rows per page
          </Label>
          <Select
            value={currentPageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger id={id} className="w-fit whitespace-nowrap">
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent className="[&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page number information */}
        <div className="flex grow justify-end whitespace-nowrap text-sm text-muted-foreground">
          <p
            className="whitespace-nowrap text-sm text-muted-foreground"
            aria-live="polite"
          >
            {displayTotalCount > 0 ? (
              <>
                <span className="text-foreground">
                  {startItem}-{endItem}
                </span>{" "}
                of{" "}
                <span className="text-foreground">
                  {displayTotalCount.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-foreground">No items</span>
            )}
          </p>
        </div>

        {/* Pagination buttons */}
        <div>
          <Pagination>
            <PaginationContent>
              {/* First page */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to first page"
                >
                  <ChevronFirst size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>

              {/* Previous page */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>

              {/* Next page */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>

              {/* Last page */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to last page"
                >
                  <ChevronLast size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
