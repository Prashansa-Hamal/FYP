"use client";

import { useState } from "react";
import {
  Table as TableIcon,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  MapPin,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  useTables,
  useDeleteTable,
  useUpdateTableStatus,
  useTableStats,
} from "@/hooks/useTables";
import { Table } from "@/types/tables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { TableGridView } from "@/components/tables/table-grid-view";
import { TableListView } from "@/components/tables/table-list-view";
import { CreateTableDialog } from "@/components/tables/create-table-dialog";
import { EditTableDialog } from "@/components/tables/edit-table-dialog";
import { TableStatsCards } from "@/components/tables/table-stats-cards";

// Components

export default function AdminTablesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: tablesData, isLoading, error, refetch } = useTables();
  const { data: statsData } = useTableStats();
  const deleteTable = useDeleteTable();
  const updateStatus = useUpdateTableStatus();

  const tables = tablesData?.data || [];
  const stats = statsData?.data;

  // Filter tables
  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      searchTerm === "" ||
      table.tableNumber.toString().includes(searchTerm) ||
      table.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || table.status === statusFilter;
    const matchesLocation =
      locationFilter === "all" || table.location === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Get unique locations for filter
  const locations = [...new Set(tables.map((t) => t.location).filter(Boolean))];

  const handleDeleteTable = async () => {
    if (!selectedTable) return;

    try {
      await deleteTable.mutateAsync(selectedTable.id);
      toast.success(`Table ${selectedTable.tableNumber} deleted successfully`);
      setDeleteDialogOpen(false);
      setSelectedTable(null);
    } catch (error) {
      toast.error("Failed to delete table");
    }
  };

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
    } catch (error) {
      toast.error("Failed to update status");
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <CheckCircle className="w-4 h-4" />;
      case "OCCUPIED":
        return <Users className="w-4 h-4" />;
      case "RESERVED":
        return <Clock className="w-4 h-4" />;
      case "OUT_OF_SERVICE":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-4">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Table Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage restaurant tables, track status, and monitor occupancy
            </p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Table
          </Button>
        </div>

        {/* Statistics Cards */}
        <TableStatsCards stats={stats} isLoading={isLoading} />

        {/* Filters and Actions */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by table number or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-gray-200"
                />
              </div>

              {/* Status Filter */}
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

              {/* Location Filter */}
              {locations.length > 0 && (
                <Select
                  value={locationFilter}
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger className="w-full sm:w-40 rounded-xl border-gray-200">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc!}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* View Toggle */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "px-3 rounded-lg",
                    viewMode === "grid" && "bg-white shadow-sm",
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "px-3 rounded-lg",
                    viewMode === "list" && "bg-white shadow-sm",
                  )}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tables Display */}
        {isLoading ? (
          <TableSkeleton viewMode={viewMode} />
        ) : filteredTables.length === 0 ? (
          <EmptyState
            onReset={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setLocationFilter("all");
            }}
          />
        ) : viewMode === "grid" ? (
          <TableGridView
            tables={filteredTables}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            onEdit={(table) => {
              setSelectedTable(table);
              setIsEditDialogOpen(true);
            }}
            onStatusChange={(table) => {
              setSelectedTable(table);
              setNewStatus(table.status);
              setStatusDialogOpen(true);
            }}
            onDelete={(table) => {
              setSelectedTable(table);
              setDeleteDialogOpen(true);
            }}
          />
        ) : (
          <TableListView
            tables={filteredTables}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            onEdit={(table) => {
              setSelectedTable(table);
              setIsEditDialogOpen(true);
            }}
            onStatusChange={(table) => {
              setSelectedTable(table);
              setNewStatus(table.status);
              setStatusDialogOpen(true);
            }}
            onDelete={(table) => {
              setSelectedTable(table);
              setDeleteDialogOpen(true);
            }}
          />
        )}

        {/* Pagination placeholder - you can add actual pagination logic */}
        {filteredTables.length > 0 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-500">
              Showing {filteredTables.length} of {tables.length} tables
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled className="gap-1">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled className="gap-1">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateTableDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          refetch();
        }}
      />

      {selectedTable && (
        <EditTableDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          table={selectedTable}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            setSelectedTable(null);
            refetch();
          }}
        />
      )}

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Table</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Table {selectedTable?.tableNumber}
              ? This action cannot be undone. The table will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTable}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteTable.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Loading Skeleton Component
function TableSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
              </div>
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
