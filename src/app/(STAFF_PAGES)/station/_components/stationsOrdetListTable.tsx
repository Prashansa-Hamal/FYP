"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  Eye,
  Clock,
  CheckCircle,
  ChefHat,
  Martini,
  Flame,
  RefreshCw,
  Filter,
  ArrowUpDown,
  Cake,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { StationOrder } from "@/types/station-orders";
import { PreparationStation } from "@/types/enums";
import { useStationOrders } from "@/hooks/useStationOrders";

interface StationOrdersTableProps {
  station: PreparationStation;
  staffId: string;
  staffName: string;
}

// Station icons mapping
const STATION_ICONS = {
  KITCHEN: ChefHat,
  BAR: Martini,
  DESSERT_STATION: Cake,
  FRY_STATION: Cake,
  GRILL_STATION: Flame,
};

// Status badge configuration
const statusConfig: Record<
  string,
  {
    variant: "default" | "secondary" | "destructive" | "outline" | "success";
    icon: any;
  }
> = {
  PENDING: { variant: "outline", icon: Clock },
  PREPARING: { variant: "secondary", icon: Clock },
  READY: { variant: "success", icon: CheckCircle },
  SERVED: { variant: "default", icon: CheckCircle },
  COMPLETED: { variant: "default", icon: CheckCircle },
  CANCELLED: { variant: "destructive", icon: CheckCircle },
};

const orderTypeConfig: Record<
  string,
  { variant: "default" | "secondary" | "outline" }
> = {
  DINE_IN: { variant: "default" },
  TAKEAWAY: { variant: "secondary" },
  DELIVERY: { variant: "outline" },
};

export function StationOrdersTable({
  station,
  staffId,
  staffName,
}: StationOrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const { data, isLoading, error, refetch } = useStationOrders(station);

  const StationIcon = STATION_ICONS[station] || ChefHat;

  const columns: ColumnDef<StationOrder>[] = useMemo(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Order #",
        cell: ({ row }) => (
          <div className="font-medium font-mono">
            <span className="text-gray-900">
              #{row.original.orderNumber.slice(-8)}
            </span>
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "customerName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Customer
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium">{row.original.customerName}</div>
            {row.original.customerPhone && (
              <div className="text-xs text-gray-500">
                {row.original.customerPhone}
              </div>
            )}
          </div>
        ),
        size: 180,
      },
      {
        accessorKey: "tableNumber",
        header: "Table",
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.tableNumber ? (
              <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-bold">
                {row.original.tableNumber}
              </div>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        ),
        size: 80,
      },
      {
        accessorKey: "orderType",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("orderType") as string;
          const config = orderTypeConfig[type] || {
            variant: "outline" as const,
          };

          return (
            <Badge variant={config.variant} className="capitalize">
              {type.replace("_", " ").toLowerCase()}
            </Badge>
          );
        },
        size: 100,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const config = statusConfig[status] || {
            variant: "outline",
            icon: Clock,
          };
          const Icon = config.icon;

          return (
            <Badge variant={config.variant as any} className="gap-1 capitalize">
              <Icon className="h-3 w-3" />
              {status.toLowerCase()}
            </Badge>
          );
        },
        size: 120,
      },
      {
        accessorKey: "stationProgress",
        header: "Progress",
        cell: ({ row }) => {
          const progress = row.original.stationProgress;

          return (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{progress.percentage}%</span>
                <span className="text-gray-900">
                  {progress.ready}/{progress.total}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    progress.percentage < 30
                      ? "bg-red-500"
                      : progress.percentage < 70
                        ? "bg-yellow-500"
                        : "bg-green-500",
                  )}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Pending: {progress.pending}</span>
                <span>Active: {progress.inProgress}</span>
              </div>
            </div>
          );
        },
        size: 160,
      },
      {
        accessorKey: "items",
        header: "Items",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-medium">
              {row.original.stationItemCount} items
            </div>
            <div className="text-sm text-gray-600">
              ${row.original.stationSubtotal.toFixed(2)}
            </div>
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "estimatedReadyTime",
        header: "Time Left",
        cell: ({ row }) => {
          if (!row.original.estimatedReadyTime) return "-";

          const estimatedTime = new Date(row.original.estimatedReadyTime);
          const now = new Date();
          const diffMs = estimatedTime.getTime() - now.getTime();
          const diffMinutes = Math.floor(diffMs / (1000 * 60));

          if (diffMinutes <= 0) {
            return (
              <Badge variant="destructive" className="animate-pulse">
                OVERDUE
              </Badge>
            );
          }

          if (diffMinutes < 10) {
            return <Badge variant="destructive">{diffMinutes}m</Badge>;
          }

          if (diffMinutes < 30) {
            return (
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-300"
              >
                {diffMinutes}m
              </Badge>
            );
          }

          return (
            <div className="text-gray-600">
              {format(estimatedTime, "h:mm a")}
            </div>
          );
        },
        size: 100,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Created
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {format(new Date(row.original.createdAt), "MMM d")}
            </div>
            <div className="text-xs text-gray-500">
              {format(new Date(row.original.createdAt), "h:mm a")}
            </div>
          </div>
        ),
        size: 120,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="text-right">
            <Button variant="ghost" size="icon" asChild>
              <a href={`/admin/orders/${row.original.orderId}`} target="_blank">
                <Eye className="h-4 w-4" />
              </a>
            </Button>
          </div>
        ),
        size: 60,
      },
    ],
    [],
  );

  const tableData = useMemo(() => {
    if (!data?.data?.all) return [];
    return data.data.all;
  }, [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          Error loading orders: {error.message}
        </div>
        <Button onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <StationIcon className="h-6 w-6 text-gray-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {station.replace("_", " ")} Orders
            </h2>
            <p className="text-sm text-gray-500">
              {data?.summary?.totalOrders || 0} total orders •{" "}
              {data?.summary?.totalItems || 0} items
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Input
              placeholder="Search orders..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 w-full sm:w-[250px]"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.column.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
                  className="hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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
                  <div className="space-y-2">
                    <div className="text-gray-500">No orders found</div>
                    <div className="text-sm text-gray-400">
                      {globalFilter
                        ? "Try a different search term"
                        : "No orders for this station yet"}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of{" "}
          {tableData.length} orders
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Show</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          <span className="text-sm">per page</span>
        </div>
      </div>

      {/* Summary Stats */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Pending Orders</div>
            <div className="text-2xl font-bold text-amber-600">
              {data.summary.pendingOrders}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Ready Orders</div>
            <div className="text-2xl font-bold text-green-600">
              {data.summary.readyOrders}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Pending Items</div>
            <div className="text-2xl font-bold text-red-600">
              {data.summary.pendingItems}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Ready Items</div>
            <div className="text-2xl font-bold text-green-600">
              {data.summary.readyItems}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
