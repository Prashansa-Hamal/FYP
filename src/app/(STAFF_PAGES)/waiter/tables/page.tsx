"use client";

import { useTables } from "@/hooks/useTables";
import { RefreshCw } from "lucide-react";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InvoiceContent } from "@/components/invoice/invoice-content";
import { TableCard } from "@/components/cards/tableCard";
import { StatCard } from "@/components/cards/stateCard";
import { TableStatus } from "@/types/tables";

// Main Component
export default function TablesView() {
  const [page] = useState(1);
  const [selectedTable, setSelectedTable] = useState<{
    id: string;
    tableNumber: number;
  } | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useTables({
    page,
    limit: 10,
    sortBy: "tableNumber",
    sortOrder: "asc",
  });

  /* Transform API → UI tables    */
  const tables = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((table) => {
      let status: TableStatus = "available";

      if (!table.isAvailable) {
        status = "occupied";
      } else if (table._count.reservations > 0) {
        status = "reserved";
      }

      return {
        id: table.id,
        tableNumber: table.tableNumber, // keep number
        seats: table.capacity,
        status,
        isAvailable: table.isAvailable,
      };
    });
  }, [data]);

  /* Stats                        */
  const stats = useMemo(() => {
    return {
      total: tables.length,
      available: tables.filter((t) => t.status === "available").length,
      occupied: tables.filter((t) => t.status === "occupied").length,
      reserved: tables.filter((t) => t.status === "reserved").length,
    };
  }, [tables]);

  if (isLoading) return <p>Loading tables...</p>;
  if (isError || !data) return <p>Failed to load tables</p>;

  return (
    <>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Tables" value={stats.total} />
          <StatCard
            title="Available"
            value={stats.available}
            className="bg-green-50 border-green-200 text-green-700"
          />
          <StatCard
            title="Occupied"
            value={stats.occupied}
            className="bg-orange-50 border-orange-200 text-orange-700"
          />
          <StatCard
            title="Reserved"
            value={stats.reserved}
            className="bg-blue-50 border-blue-200 text-blue-700"
          />
        </div>

        {/* Tables Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex w-full justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-900">Table Layout</h3>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw
                className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tables.map((table) => (
              <TableCard
                key={table.id}
                setSelectedTable={setSelectedTable}
                {...table}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Invoice Dialog */}
      <Dialog
        open={!!selectedTable}
        onOpenChange={() => setSelectedTable(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Table {selectedTable?.tableNumber} Invoice
            </DialogTitle>
          </DialogHeader>

          <InvoiceContent tableNumber={selectedTable?.tableNumber} />
        </DialogContent>
      </Dialog>
    </>
  );
}
