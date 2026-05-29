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

import { ColumnDef, Row } from "@tanstack/react-table";
import {
  Eye,
  Filter,
  MoreVertical,
  RefreshCw,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  MapPin,
  Edit,
  CalendarCheck,
  Phone,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { UpdateReservationDialog } from "./update-reservation-dialog";
import { format } from "date-fns";

import { Reservation, ReservationFilters } from "@/types/reservations";
import {
  useCancelReservation,
  useCheckInReservation,
  useReservations,
} from "@/hooks/useReservations";
import { ReservationDetailsDialog } from "./reservationDetailsDialog";

export function ReservationsDataTable() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReservationsDataTableContent />
    </Suspense>
  );
}

// Define the reservation row type
export interface ReservationRow {
  id: string;
  reservationDate: string;
  partySize: number;
  status: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  tables: { tableNumber: number; capacity: number }[];
  specialRequests: string | null;
  createdAt: string;
  checkedInAt: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
}

// Status badge configurations
export const statusConfig: Record<
  string,
  {
    variant: "default" | "secondary" | "destructive" | "outline" | "success";
    icon: React.ReactNode;
    label: string;
  }
> = {
  CONFIRMED: {
    variant: "success",
    icon: <CheckCircle className="h-3 w-3 mr-1" />,
    label: "Confirmed",
  },
  CANCELLED: {
    variant: "destructive",
    icon: <XCircle className="h-3 w-3 mr-1" />,
    label: "Cancelled",
  },
  COMPLETED: {
    variant: "secondary",
    icon: <CalendarCheck className="h-3 w-3 mr-1" />,
    label: "Completed",
  },
};

const reservationColumns = (
  handleViewDetails: (reservation: ReservationRow) => void,
  handleCheckIn: (id: string) => void,
  handleCancel: (id: string) => void,
): ColumnDef<ReservationRow>[] => [
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
    header: "Customer",
    accessorKey: "userName",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">{row.original.userName}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.userEmail}
        </div>
      </div>
    ),
    size: 200,
  },
  {
    header: "Date & Time",
    accessorKey: "reservationDate",
    cell: ({ row }) => {
      const date = new Date(row.original.reservationDate);
      return (
        <div className="space-y-1">
          <div className="font-medium">{format(date, "MMM d, yyyy")}</div>
          <div className="text-xs text-muted-foreground">
            {format(date, "h:mm a")}
          </div>
        </div>
      );
    },
    size: 150,
  },
  {
    header: "Party Size",
    accessorKey: "partySize",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.partySize}</span>
      </div>
    ),
    size: 100,
  },
  {
    header: "Tables",
    accessorKey: "tables",
    cell: ({ row }) => {
      const tables = row.original.tables;
      if (!tables || tables.length === 0) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {tables.map((table) => (
            <Badge key={table.tableNumber} variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" />T{table.tableNumber}
            </Badge>
          ))}
        </div>
      );
    },
    size: 120,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = statusConfig[status] || {
        variant: "outline" as const,
        icon: null,
        label: status,
      };

      return (
        <Badge variant={config.variant as any} className="gap-1">
          {config.icon}
          {config.label}
        </Badge>
      );
    },
    size: 120,
  },
  {
    header: "Contact",
    accessorKey: "userPhone",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <Phone className="h-3 w-3 text-muted-foreground" />
        <span>{row.original.userPhone || "-"}</span>
      </div>
    ),
    size: 120,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <ReservationActions
        row={row}
        onViewDetails={handleViewDetails}
        onCheckIn={handleCheckIn}
        onCancel={handleCancel}
      />
    ),
    size: 60,
    enableHiding: false,
  },
];

// Reservation Actions Component
const ReservationActions = ({
  row,
  onViewDetails,
  onCheckIn,
  onCancel,
}: {
  row: Row<ReservationRow>;
  onViewDetails: (reservation: ReservationRow) => void;
  onCheckIn: (id: string) => void;
  onCancel: (id: string) => void;
}) => {
  const reservation = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" type="button">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col">
        <DropdownMenuItem onClick={() => onViewDetails(reservation)}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>

        <UpdateReservationDialog
          id={reservation.id}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Reservation
            </DropdownMenuItem>
          }
        />

        {reservation.status === "CONFIRMED" && (
          <>
            <Separator className="my-1" />
            <DropdownMenuItem onClick={() => onCheckIn(reservation.id)}>
              <CalendarCheck className="h-4 w-4 mr-2 text-green-600" />
              Check In
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onCancel(reservation.id)}
              className="text-red-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Reservation
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Filter Components
interface StatusFilterProps {
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
}

const StatusFilter = ({
  selectedStatuses,
  onStatusChange,
}: StatusFilterProps) => {
  const statusOptions = ["CONFIRMED", "COMPLETED", "CANCELLED"];

  const handleStatusToggle = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    onStatusChange(newStatuses);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Status
          {selectedStatuses.length > 0 && (
            <span className="ml-2 h-5 rounded bg-primary/10 px-1.5 text-xs font-medium">
              {selectedStatuses.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" align="start">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Filter by status
          </div>
          {statusOptions.map((status) => {
            const config = statusConfig[status];
            return (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={() => handleStatusToggle(status)}
                />
                <Label
                  htmlFor={`status-${status}`}
                  className="text-sm font-normal cursor-pointer flex items-center gap-1"
                >
                  {config?.icon}
                  {config?.label}
                </Label>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface PartySizeFilterProps {
  selectedSizes: number[];
  onSizeChange: (sizes: number[]) => void;
}

const PartySizeFilter = ({
  selectedSizes,
  onSizeChange,
}: PartySizeFilterProps) => {
  const sizeOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleSizeToggle = (size: number) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    onSizeChange(newSizes);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="mr-2 h-4 w-4" />
          Party Size
          {selectedSizes.length > 0 && (
            <span className="ml-2 h-5 rounded bg-primary/10 px-1.5 text-xs font-medium">
              {selectedSizes.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" align="start">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Filter by party size
          </div>
          <div className="grid grid-cols-5 gap-2">
            {sizeOptions.map((size) => (
              <Button
                key={size}
                variant={selectedSizes.includes(size) ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleSizeToggle(size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (start: string, end: string) => void;
}

const DateRangeFilter = ({
  startDate,
  endDate,
  onDateRangeChange,
}: DateRangeFilterProps) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  const applyFilter = () => {
    onDateRangeChange(localStartDate, localEndDate);
  };

  const clearFilter = () => {
    setLocalStartDate("");
    setLocalEndDate("");
    onDateRangeChange("", "");
  };

  const hasFilter = startDate || endDate;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Date Range
          {hasFilter && (
            <span className="ml-2 h-5 rounded bg-primary/10 px-1.5 text-xs font-medium">
              1
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-4" align="start">
        <div className="space-y-4">
          <div className="text-xs font-medium text-muted-foreground">
            Filter by date range
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <input
              id="start-date"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <input
              id="end-date"
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={clearFilter}>
              Clear
            </Button>
            <Button size="sm" onClick={applyFilter}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Main Reservations Data Table Component
export function ReservationsDataTableContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationRow | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Get query parameters
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";

  // Get filter parameters
  const statusParam = searchParams.get("status") || "";
  const partySizeParam = searchParams.get("partySize") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  // Parse arrays from comma-separated values
  const statuses = statusParam ? statusParam.split(",").filter(Boolean) : [];
  const partySizes = partySizeParam
    ? partySizeParam.split(",").map(Number).filter(Boolean)
    : [];

  // Build filters for the query
  const filters: ReservationFilters = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      status: statuses.length > 0 ? statuses : undefined,
      partySize: partySizes.length > 0 ? partySizes : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [page, limit, search, statuses, partySizes, startDate, endDate],
  );

  const {
    data: reservationsData,
    isLoading,
    refetch,
  } = useReservations(filters);
  const cancelReservation = useCancelReservation();
  const checkInReservation = useCheckInReservation();

  const totalCount = reservationsData?.pagination?.total || 0;
  const totalPages = reservationsData?.pagination?.pages || 1;

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

  // Handle status filter change
  const handleStatusFilterChange = (selectedStatuses: string[]) => {
    updateUrlWithFilters({
      status: selectedStatuses.length > 0 ? selectedStatuses.join(",") : null,
    });
  };

  // Handle party size filter change
  const handlePartySizeFilterChange = (selectedSizes: number[]) => {
    updateUrlWithFilters({
      partySize: selectedSizes.length > 0 ? selectedSizes.join(",") : null,
    });
  };

  // Handle date range filter change
  const handleDateRangeChange = (start: string, end: string) => {
    updateUrlWithFilters({
      startDate: start || null,
      endDate: end || null,
    });
  };

  // Handle view details
  const handleViewDetails = (reservation: ReservationRow) => {
    setSelectedReservation(reservation);
    setDetailsDialogOpen(true);
  };

  // Handle check in
  const handleCheckIn = (id: string) => {
    checkInReservation.mutate(id);
  };

  // Handle cancel
  const handleCancel = (id: string) => {
    cancelReservation.mutate(id);
  };

  // Clear all filters
  const clearAllFilters = () => {
    updateUrlWithFilters({
      search: null,
      status: null,
      partySize: null,
      startDate: null,
      endDate: null,
      page: "1",
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    search ||
    statuses.length > 0 ||
    partySizes.length > 0 ||
    startDate ||
    endDate;

  // Transform data for the table
  const tableData: ReservationRow[] = useMemo(() => {
    return (reservationsData?.data ?? []).map((reservation: Reservation) => ({
      id: reservation.id,
      reservationDate: reservation.reservationDate,
      partySize: reservation.partySize,
      status: reservation.status,
      userName: reservation.user?.name || "N/A",
      userEmail: reservation.user?.email || "N/A",
      userPhone: reservation.user?.phone || "",
      tables: reservation.tables || [],
      specialRequests: reservation.specialRequests,
      createdAt: reservation.createdAt,
      checkedInAt: reservation.checkedInAt,
      cancelledAt: reservation.cancelledAt,
      completedAt: reservation.completedAt,
    }));
  }, [reservationsData]);

  const columns = useMemo(
    () => reservationColumns(handleViewDetails, handleCheckIn, handleCancel),
    [],
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <AnimatedSkeletonDataTable
          columnCount={8}
          rowCount={8}
          showToolbar={true}
          showPagination={true}
        />
      </div>
    );
  }

  return (
    <>
      <DataTable
        data={tableData}
        columns={columns}
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
        defaultSortColumn="reservationDate"
        renderToolbar={() => (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {/* Status Filter */}
              <StatusFilter
                selectedStatuses={statuses}
                onStatusChange={handleStatusFilterChange}
              />

              {/* Party Size Filter */}
              <PartySizeFilter
                selectedSizes={partySizes}
                onSizeChange={handlePartySizeFilterChange}
              />

              {/* Date Range Filter */}
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onDateRangeChange={handleDateRangeChange}
              />
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-8"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

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

      {/* Reservation Details Dialog */}
      <ReservationDetailsDialog
        reservation={selectedReservation}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </>
  );
}
