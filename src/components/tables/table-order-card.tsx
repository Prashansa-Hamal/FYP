"use client";

import { TableWithOrders } from "@/types/tables";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MapPin,
  Clock,
  Package,
  ChefHat,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableOrderCardProps {
  table: TableWithOrders;
  onStatusChange: (table: TableWithOrders) => void;
  onViewOrder: (order: any) => void;
  onMarkOrderReady: (orderId: string) => void;
  onServeOrder: (orderId: string) => void;
}

export function TableOrderCard({
  table,
  onStatusChange,
  onViewOrder,
  onMarkOrderReady,
  onServeOrder,
}: TableOrderCardProps) {
  const hasActiveOrders = table.orders && table.orders.length > 0;
  const activeOrder = table.orders?.[0];

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

  const getOrderStatusBadge = (status: string) => {
    const config = {
      PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
      CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
      PREPARING: { label: "Preparing", color: "bg-orange-100 text-orange-700" },
      READY: { label: "Ready", color: "bg-green-100 text-green-700" },
      SERVED: { label: "Served", color: "bg-purple-100 text-purple-700" },
      COMPLETED: { label: "Completed", color: "bg-gray-100 text-gray-700" },
    };
    const { label, color } =
      config[status as keyof typeof config] || config.PENDING;
    return <Badge className={cn("text-xs", color)}>{label}</Badge>;
  };

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-200 border-0 shadow-md overflow-hidden",
        hasActiveOrders && "ring-2 ring-amber-200",
      )}
    >
      {/* Table Header */}
      <div className={cn("p-4", hasActiveOrders ? "" : "bg-white")}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <span className="text-xl font-bold text-amber-600">
                {table.tableNumber}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">
                  Table {table.tableNumber}
                </p>
                <Badge className={cn("gap-1", getStatusColor(table.status))}>
                  {getStatusIcon(table.status)}
                  <span>{table.status.replace("_", " ")}</span>
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>Capacity: {table.capacity}</span>
                </div>
                {table.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{table.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onStatusChange(table)}>
                Change Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active Order Info */}
        {hasActiveOrders && activeOrder && (
          <div className="mt-3 p-3 bg-white rounded-xl border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700">
                  Order #{activeOrder.orderNumber}
                </span>
                {getOrderStatusBadge(activeOrder.status)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewOrder(activeOrder)}
                className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700"
              >
                <Eye className="w-3 h-3 mr-1" />
                Details
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Items:</span>
                <span className="font-medium text-gray-900">
                  {activeOrder.items?.length || 0} items
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-amber-600">
                  Rs {activeOrder.finalAmount}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  Placed: {format(new Date(activeOrder.createdAt), "hh:mm a")}
                </span>
                <span>By: {activeOrder.user?.name || "Guest"}</span>
              </div>
            </div>

            {/* Action Buttons for Active Order */}
            {activeOrder.status === "READY" && (
              <Button
                onClick={() => onServeOrder(activeOrder.id)}
                className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white h-9 text-sm"
              >
                <Utensils className="w-4 h-4 mr-2" />
                Mark as Served
              </Button>
            )}

            {activeOrder.status === "PREPARING" && (
              <Button
                onClick={() => onMarkOrderReady(activeOrder.id)}
                variant="outline"
                className="w-full mt-3 border-green-200 text-green-600 hover:bg-green-50 h-9 text-sm"
              >
                <ChefHat className="w-4 h-4 mr-2" />
                Mark as Ready
              </Button>
            )}
          </div>
        )}

        {/* No Active Orders */}
        {!hasActiveOrders && table.status !== "AVAILABLE" && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl text-center">
            <p className="text-sm text-gray-500">No active orders</p>
            <Button
              onClick={() => onStatusChange(table)}
              variant="ghost"
              size="sm"
              className="mt-2 text-amber-600"
            >
              Update Status
            </Button>
          </div>
        )}

        {/* Available Table */}
        {table.status === "AVAILABLE" && !hasActiveOrders && (
          <div className="mt-3 p-3 bg-green-50 rounded-xl text-center">
            <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-sm text-green-700">Table is ready for guests</p>
          </div>
        )}
      </div>
    </Card>
  );
}
