"use client";

import { DataTable } from "@/components/data-table";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
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
import { OrderItem, useOrders } from "@/hooks/useOrders";
import { formatCurrency } from "@/lib/formatters";
import { ColumnDef, Row } from "@tanstack/react-table";
import {
  Eye,
  Filter,
  MoreVertical,
  Printer,
  RefreshCw,
  Truck,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

// Define the order row type
interface OrderRow {
  id: string;
  orderNumber: string;
  userName: string;
  userEmail: string;
  tableNumber?: number;
  orderType: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  itemCount: number;
  items: OrderItem[];
  userPhone: string;
  taxAmount: number;
  createdAt: string;
  estimatedReadyTime?: string;
}

// Status badge configurations
const statusConfig: Record<
  string,
  {
    variant: "default" | "secondary" | "destructive" | "outline" | "success";
    icon: React.ReactNode;
  }
> = {
  PENDING: { variant: "outline", icon: <Clock className="h-3 w-3 mr-1" /> },
  CONFIRMED: {
    variant: "secondary",
    icon: <CheckCircle className="h-3 w-3 mr-1" />,
  },
  PREPARING: {
    variant: "secondary",
    icon: <AlertCircle className="h-3 w-3 mr-1" />,
  },
  READY: { variant: "success", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
  SERVED: { variant: "default", icon: <Truck className="h-3 w-3 mr-1" /> },
  COMPLETED: {
    variant: "default",
    icon: <CheckCircle className="h-3 w-3 mr-1" />,
  },
  CANCELLED: {
    variant: "destructive",
    icon: <XCircle className="h-3 w-3 mr-1" />,
  },
};

// Payment status badge configurations
const paymentStatusConfig: Record<
  string,
  {
    variant: "default" | "secondary" | "destructive" | "outline" | "success";
    icon: React.ReactNode;
  }
> = {
  PENDING: { variant: "outline", icon: <Clock className="h-3 w-3 mr-1" /> },
  PROCESSING: {
    variant: "secondary",
    icon: <RefreshCw className="h-3 w-3 mr-1" />,
  },
  COMPLETED: {
    variant: "success",
    icon: <CheckCircle className="h-3 w-3 mr-1" />,
  },
  FAILED: {
    variant: "destructive",
    icon: <XCircle className="h-3 w-3 mr-1" />,
  },
  REFUNDED: {
    variant: "destructive",
    icon: <CreditCard className="h-3 w-3 mr-1" />,
  },
  PARTIALLY_REFUNDED: {
    variant: "outline",
    icon: <CreditCard className="h-3 w-3 mr-1" />,
  },
};

// Order type badge configurations
const orderTypeConfig: Record<
  string,
  { variant: "default" | "secondary" | "outline" }
> = {
  DINE_IN: { variant: "default" },
  TAKEAWAY: { variant: "secondary" },
  DELIVERY: { variant: "outline" },
};

const orderColumns: ColumnDef<OrderRow>[] = [
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
    header: "Order #",
    accessorKey: "orderNumber",
    cell: ({ row }) => (
      <div className="font-medium font-mono text-sm">
        <Link
          href={`/admin/orders/${row.original.id}`}
          className="hover:underline"
        >
          #{row.getValue<string>("orderNumber").slice(0, 8)}
        </Link>
      </div>
    ),
    size: 120,
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
    header: "Type",
    accessorKey: "orderType",
    cell: ({ row }) => {
      const type = row.getValue("orderType") as string;
      const config = orderTypeConfig[type] || { variant: "outline" as const };

      return (
        <Badge variant={config.variant} className="capitalize">
          {type.replace("_", " ").toLowerCase()}
        </Badge>
      );
    },
    size: 100,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const config = statusConfig[status] || {
        variant: "outline" as const,
        icon: null,
      };

      return (
        <Badge variant={config.variant as any} className="gap-1 capitalize">
          {config.icon}
          {status.toLowerCase()}
        </Badge>
      );
    },
    size: 120,
  },
  {
    header: "Payment",
    accessorKey: "paymentStatus",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const config = paymentStatusConfig[status] || {
        variant: "outline" as const,
        icon: null,
      };

      return (
        <Badge variant={config.variant as any} className="gap-1 capitalize">
          {config.icon}
          {status.toLowerCase()}
        </Badge>
      );
    },
    size: 120,
  },
  {
    header: "Amount",
    accessorKey: "finalAmount",
    cell: ({ row }) => (
      <div className="font-medium">
        {formatCurrency(row.original.finalAmount)}
        {row.original.discountAmount > 0 && (
          <div className="text-xs text-muted-foreground line-through">
            {formatCurrency(row.original.totalAmount)}
          </div>
        )}
      </div>
    ),
    size: 100,
  },
  {
    header: "Items",
    accessorKey: "itemCount",
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.original.itemCount}</div>
    ),
    size: 80,
  },
  {
    header: "Table",
    accessorKey: "tableNumber",
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.original.tableNumber || "-"}
      </div>
    ),
    size: 80,
  },
  {
    header: "Created",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    ),
    size: 120,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <OrderActions row={row} />,
    size: 60,
    enableHiding: false,
  },
];

export function OrdersDataTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get query parameters
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";

  // Get filter parameters
  const statusParam = searchParams.get("status") || "";
  const paymentStatusParam = searchParams.get("paymentStatus") || "";
  const orderTypeParam = searchParams.get("orderType") || "";

  // Parse arrays from comma-separated values
  const statuses = statusParam ? statusParam.split(",").filter(Boolean) : [];
  const paymentStatuses = paymentStatusParam
    ? paymentStatusParam.split(",").filter(Boolean)
    : [];
  const orderTypes = orderTypeParam
    ? orderTypeParam.split(",").filter(Boolean)
    : [];

  // Build filters for the query
  const filters = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      status: statuses.length > 0 ? statuses : undefined,
      paymentStatus: paymentStatuses.length > 0 ? paymentStatuses : undefined,
      orderType: orderTypes.length > 0 ? orderTypes : undefined,
    }),
    [page, limit, search, statuses, paymentStatuses, orderTypes]
  );

  const { data: ordersData, isLoading, refetch } = useOrders(filters);

  const totalCount = ordersData?.pagination?.total || 0;
  const totalPages = ordersData?.pagination?.pages || 1;

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

  // Handle payment status filter change
  const handlePaymentStatusFilterChange = (selectedStatuses: string[]) => {
    updateUrlWithFilters({
      paymentStatus:
        selectedStatuses.length > 0 ? selectedStatuses.join(",") : null,
    });
  };

  // Handle order type filter change
  const handleOrderTypeFilterChange = (selectedTypes: string[]) => {
    updateUrlWithFilters({
      orderType: selectedTypes.length > 0 ? selectedTypes.join(",") : null,
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    updateUrlWithFilters({
      search: null,
      status: null,
      paymentStatus: null,
      orderType: null,
      page: "1",
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    search ||
    statuses.length > 0 ||
    paymentStatuses.length > 0 ||
    orderTypes.length > 0;

  // Transform data for the table
  const tableData: OrderRow[] = useMemo(() => {
    return (ordersData?.data ?? []).map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      userName: order.userName,
      userEmail: order.userEmail,
      tableNumber: order.tableNumber,
      orderType: order.orderType,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod || "",
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount,
      finalAmount: order.finalAmount,
      itemCount: order.itemCount,
      items: order.items,
      userPhone: order.userPhone || "",
      taxAmount: order.taxAmount,
      createdAt: order.createdAt,
      estimatedReadyTime: order.estimatedReadyTime,
    }));
  }, [ordersData]);

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
    <DataTable
      data={tableData}
      columns={orderColumns}
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
      defaultSortColumn="createdAt"
      renderToolbar={() => (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <StatusFilter
              selectedStatuses={statuses}
              onStatusChange={handleStatusFilterChange}
            />

            {/* Payment Status Filter */}
            <PaymentStatusFilter
              selectedStatuses={paymentStatuses}
              onStatusChange={handlePaymentStatusFilterChange}
            />

            {/* Order Type Filter */}
            <OrderTypeFilter
              selectedTypes={orderTypes}
              onTypeChange={handleOrderTypeFilterChange}
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
  );
}

const OrderActions = ({ row }: { row: Row<OrderRow> }) => {
  const order = row.original;

  // Mock data - replace with actual order data
  const invoiceItems =
    order.items?.map((item: OrderItem) => ({
      id: item.id,
      name: item.menuItem?.name || "Item",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      specialInstructions: item.specialInstructions,
    })) || [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" type="button">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/orders/${order.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </DropdownMenuItem>

        {/* Add Invoice Preview */}
        <DropdownMenuItem asChild>
          <InvoicePreview
            orderNumber={order.orderNumber}
            orderDate={order.createdAt}
            customerName={order.userName}
            customerEmail={order.userEmail}
            customerPhone={order.userPhone}
            tableNumber={order.tableNumber}
            orderType={order.orderType}
            items={invoiceItems}
            subtotal={order.totalAmount}
            taxAmount={order.taxAmount}
            discountAmount={order.discountAmount}
            totalAmount={order.finalAmount}
            paymentStatus={order.paymentStatus}
            paymentMethod={order.paymentMethod}
          />
        </DropdownMenuItem>

        <Separator className="my-1" />
        <DropdownMenuItem className="text-yellow-600">
          <Clock className="h-4 w-4 mr-2" />
          Update Status
        </DropdownMenuItem>
        <DropdownMenuItem className="text-blue-600">
          <CreditCard className="h-4 w-4 mr-2" />
          Process Payment
        </DropdownMenuItem>
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
  const statusOptions = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "SERVED",
    "COMPLETED",
    "CANCELLED",
  ];

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
            const config = statusConfig[status] || {
              variant: "outline" as const,
              icon: null,
            };

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
                  {config.icon}
                  {status.toLowerCase()}
                </Label>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface PaymentStatusFilterProps {
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
}

const PaymentStatusFilter = ({
  selectedStatuses,
  onStatusChange,
}: PaymentStatusFilterProps) => {
  const paymentStatusOptions = [
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ];

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
          <CreditCard className="mr-2 h-4 w-4" />
          Payment
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
            Filter by payment status
          </div>
          {paymentStatusOptions.map((status) => {
            const config = paymentStatusConfig[status] || {
              variant: "outline" as const,
              icon: null,
            };

            return (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`payment-status-${status}`}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={() => handleStatusToggle(status)}
                />
                <Label
                  htmlFor={`payment-status-${status}`}
                  className="text-sm font-normal cursor-pointer flex items-center gap-1"
                >
                  {config.icon}
                  {status.toLowerCase()}
                </Label>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface OrderTypeFilterProps {
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
}

const OrderTypeFilter = ({
  selectedTypes,
  onTypeChange,
}: OrderTypeFilterProps) => {
  const orderTypeOptions = ["DINE_IN", "TAKEAWAY", "DELIVERY"];

  const handleTypeToggle = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];

    onTypeChange(newTypes);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Truck className="mr-2 h-4 w-4" />
          Type
          {selectedTypes.length > 0 && (
            <span className="ml-2 h-5 rounded bg-primary/10 px-1.5 text-xs font-medium">
              {selectedTypes.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" align="start">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Filter by order type
          </div>
          {orderTypeOptions.map((type) => {
            const config = orderTypeConfig[type] || {
              variant: "outline" as const,
            };

            return (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`order-type-${type}`}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => handleTypeToggle(type)}
                />
                <Label
                  htmlFor={`order-type-${type}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  <Badge variant={config.variant} className="mr-2">
                    {type.replace("_", " ").toLowerCase()}
                  </Badge>
                </Label>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
