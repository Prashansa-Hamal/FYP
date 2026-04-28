"use client";

import { useState } from "react";
import {
  Table as TableIcon,
  Search,
  RefreshCw,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useTablesWithOrders,
  useUpdateTableStatus,
  useTables,
} from "@/hooks/useTables";
import { TableWithOrders } from "@/types/tables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableOrderCard } from "@/components/tables/table-order-card";
import { OrderDetailsDialog } from "@/components/tables/order-details-dialog";

export default function StaffTablesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTable, setSelectedTable] = useState<TableWithOrders | null>(
    null,
  );
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"all" | "occupied" | "available">(
    "all",
  );

  const {
    data: tablesWithOrdersData,
    isLoading,
    error,
    refetch,
  } = useTablesWithOrders();
  const { data: allTablesData } = useTables();
  const updateStatus = useUpdateTableStatus();

  const tablesWithOrders = tablesWithOrdersData?.data || [];
  const allTables = allTablesData?.data || [];

  // Combine all tables with their order info
  const allTablesWithInfo: TableWithOrders[] = allTables.map((table) => {
    const tableWithOrder = tablesWithOrders.find((t) => t.id === table.id);
    return {
      ...table,
      orders: tableWithOrder?.orders || [],
      totalItems: tableWithOrder?.totalItems || 0,
      totalAmount: tableWithOrder?.totalAmount || 0,
    };
  });

  // Filter tables
  const filteredTables = allTablesWithInfo.filter((table) => {
    const matchesSearch =
      searchTerm === "" ||
      table.tableNumber.toString().includes(searchTerm) ||
      table.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || table.status === statusFilter;

    let matchesTab = true;
    if (activeTab === "occupied") {
      matchesTab =
        table.status === "OCCUPIED" ||
        (table.orders && table.orders.length > 0);
    } else if (activeTab === "available") {
      matchesTab = table.status === "AVAILABLE";
    }

    return matchesSearch && matchesStatus && matchesTab;
  });

  // Sort: occupied tables first, then reserved, then available
  const sortedTables = [...filteredTables].sort((a, b) => {
    const statusOrder = {
      OCCUPIED: 0,
      RESERVED: 1,
      AVAILABLE: 2,
      OUT_OF_SERVICE: 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const handleStatusChange = async () => {
    if (!selectedTable || !newStatus) return;

    try {
      await updateStatus.mutateAsync({
        id: selectedTable.id,
        data: { status: newStatus as any },
      });
      toast.success(
        `Table ${selectedTable.tableNumber} status updated to ${newStatus}`,
      );
      setStatusDialogOpen(false);
      setSelectedTable(null);
      setNewStatus("");
      refetch();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleMarkOrderReady = (orderId: string) => {
    // This would call an API to mark order as ready
    toast.success("Order marked as ready");
    refetch();
  };

  const handleServeOrder = (orderId: string) => {
    // This would call an API to mark order as served
    toast.success("Order served successfully");
    refetch();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-700 border-green-200";
      case "OCCUPIED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "RESERVED":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "OUT_OF_SERVICE":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                Failed to Load Tables
              </h3>
              <p className="text-red-600 text-center mb-4">{error.message}</p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const occupiedCount = allTablesWithInfo.filter(
    (t) => t.status === "OCCUPIED" || t.orders.length > 0,
  ).length;
  const availableCount = allTablesWithInfo.filter(
    (t) => t.status === "AVAILABLE",
  ).length;
  const reservedCount = allTablesWithInfo.filter(
    (t) => t.status === "RESERVED",
  ).length;

  return (
    <div className="min-h-screen  p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tables & Orders
            </h1>
            <p className="text-gray-600 mt-1">
              Manage table status and track active orders
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="gap-2 border-gray-200"
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Occupied Tables</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {occupiedCount}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Tables</p>
                  <p className="text-2xl font-bold text-green-600">
                    {availableCount}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-yellow-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reserved</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {reservedCount}
                  </p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tables</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {allTables.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <TableIcon className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-white data-[state=active]:text-amber-600 rounded-lg"
            >
              All Tables
            </TabsTrigger>
            <TabsTrigger
              value="occupied"
              className="data-[state=active]:bg-white data-[state=active]:text-amber-600 rounded-lg"
            >
              <Users className="w-4 h-4 mr-2" />
              Occupied ({occupiedCount})
            </TabsTrigger>
            <TabsTrigger
              value="available"
              className="data-[state=active]:bg-white data-[state=active]:text-amber-600 rounded-lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Available ({availableCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by table number or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-gray-200"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 rounded-xl border-gray-200">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                  <SelectItem value="RESERVED">Reserved</SelectItem>
                  <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tables Grid */}
        {isLoading ? (
          <TableSkeleton />
        ) : sortedTables.length === 0 ? (
          <EmptyState
            onReset={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setActiveTab("all");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTables.map((table) => (
              <TableOrderCard
                key={table.id}
                table={table}
                onStatusChange={(t) => {
                  setSelectedTable(t);
                  setNewStatus(t.status);
                  setStatusDialogOpen(true);
                }}
                onViewOrder={handleViewOrder}
                onMarkOrderReady={handleMarkOrderReady}
                onServeOrder={handleServeOrder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Update Table Status</DialogTitle>
            <DialogDescription>
              Change the status for Table {selectedTable?.tableNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="OCCUPIED">Occupied</SelectItem>
                <SelectItem value="RESERVED">Reserved</SelectItem>
                <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={
                updateStatus.isPending ||
                !newStatus ||
                newStatus === selectedTable?.status
              }
              className="bg-amber-500 hover:bg-amber-600"
            >
              {updateStatus.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        open={orderDetailsOpen}
        onOpenChange={setOrderDetailsOpen}
        order={selectedOrder}
      />
    </div>
  );
}

// Table Skeleton Component
function TableSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div>
                  <Skeleton className="h-5 w-20 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-px w-full my-3" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-8 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Empty State Component
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <TableIcon className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Tables Found
        </h3>
        <p className="text-gray-500 text-center mb-4">
          No tables match your current filters. Try adjusting your search or
          filters.
        </p>
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
}
