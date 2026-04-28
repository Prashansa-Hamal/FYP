"use client";

import { useState, useMemo } from "react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { OrderStatus, OrderType, PaymentStatus } from "@/types/enums";
import { Order } from "@/types/orders";
import {
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Users,
  MapPin,
  Phone,
  Wifi,
  Package,
  CreditCard,
  Eye,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Order Status Configuration
const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: any; order: number }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Clock,
    order: 1,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: CheckCircle,
    order: 2,
  },
  PREPARING: {
    label: "Preparing",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: ChefHat,
    order: 3,
  },
  READY: {
    label: "Ready",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle,
    order: 4,
  },
  SERVED: {
    label: "Served",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: CheckCircle,
    order: 5,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: CheckCircle,
    order: 6,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
    order: 7,
  },
};

// Order Type Configuration
const orderTypeConfig: Record<OrderType, { label: string; icon: any }> = {
  DINE_IN: { label: "Dine In", icon: Users },
  TAKEAWAY: { label: "Takeaway", icon: Package },
  DELIVERY: { label: "Delivery", icon: MapPin },
};

export default function OrdersView() {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);

  const { data, isLoading, error, refetch } = useOrders({
    page: 1,
    limit: 50,
    status: filterStatus !== "all" ? [filterStatus] : undefined,
  });

  const updateOrderStatus = useUpdateOrderStatus();

  const orders = data?.data || [];

  // Filter orders by search term
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;

    const term = searchTerm.toLowerCase();
    return orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(term) ||
        order.userName?.toLowerCase().includes(term) ||
        order.tableNumber?.toString().includes(term),
    );
  }, [orders, searchTerm]);

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await updateOrderStatus.mutateAsync({
        id: selectedOrder.id,
        status: newStatus,
      });
      toast.success(
        `Order #${selectedOrder.orderNumber} updated to ${statusConfig[newStatus].label}`,
      );
      setStatusDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus> = {
      PENDING: "CONFIRMED",
      CONFIRMED: "PREPARING",
      PREPARING: "READY",
      READY: "SERVED",
      SERVED: "COMPLETED",
      COMPLETED: "COMPLETED",
      CANCELLED: "CANCELLED",
    };
    return statusFlow[currentStatus];
  };

  const getActionButton = (order: Order) => {
    const nextStatus = getNextStatus(order.status as OrderStatus);
    if (!nextStatus || nextStatus === order.status) return null;

    const config = statusConfig[nextStatus];

    return (
      <Button
        onClick={() => {
          setSelectedOrder(order);
          setNewStatus(nextStatus);
          setStatusDialogOpen(true);
        }}
        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
      >
        <config.icon className="w-4 h-4 mr-2" />
        Mark as {config.label}
      </Button>
    );
  };

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <XCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                Failed to Load Orders
              </h3>
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
    <div className="min-h-screen">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by order number, customer name, or table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-gray-200"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs
        defaultValue="all"
        className="mb-6"
        onValueChange={(v) => setFilterStatus(v as OrderStatus | "all")}
      >
        <TabsList className="inline-flex w-auto bg-gray-100 p-1 rounded-xl overflow-x-auto">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:text-amber-600 rounded-lg whitespace-nowrap"
          >
            All Orders
          </TabsTrigger>
          {Object.entries(statusConfig).map(([status, config]) => (
            <TabsTrigger
              key={status}
              value={status}
              className="data-[state=active]:bg-white data-[state=active]:text-amber-600 rounded-lg whitespace-nowrap"
            >
              <config.icon className="w-4 h-4 mr-1" />
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Orders Found
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "No orders match your search criteria."
              : "No orders with this status."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const StatusIcon =
              statusConfig[order.status as OrderStatus]?.icon || Clock;
            const TypeIcon =
              orderTypeConfig[order.orderType as OrderType]?.icon || Package;

            return (
              <Card
                key={order.id}
                className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md overflow-hidden"
              >
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">
                            #{order.orderNumber}
                          </h3>
                          <Badge
                            className={cn(
                              "gap-1",
                              statusConfig[order.status as OrderStatus]?.color,
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[order.status as OrderStatus]?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <TypeIcon className="w-3 h-3" />
                            {
                              orderTypeConfig[order.orderType as OrderType]
                                ?.label
                            }
                          </span>
                          {order.tableNumber && (
                            <span>Table {order.tableNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-amber-600">
                        Rs {order.finalAmount}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(order.createdAt), "hh:mm a")}
                      </p>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-1 mb-3">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.menuItem.name}
                        </span>
                        <span className="text-gray-700">
                          Rs {item.totalPrice}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-gray-400">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Users className="w-3 h-3" />
                    <span>{order.userName || "Guest"}</span>
                    {order.paymentMethod && (
                      <>
                        <span className="text-gray-300">•</span>
                        <CreditCard className="w-3 h-3" />
                        <span className="capitalize">
                          {order.paymentMethod.toLowerCase()}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    {getActionButton(order)}
                    <Button
                      variant="outline"
                      onClick={() => handleViewDetails(order)}
                      className="border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 rounded-2xl">
          <ScrollArea className="max-h-[90vh]">
            <div className="p-6">
              {selectedOrder && (
                <>
                  <DialogHeader>
                    <div className="flex items-center justify-between mb-4">
                      <DialogTitle className="text-2xl font-bold">
                        Order #{selectedOrder.orderNumber}
                      </DialogTitle>
                      <Badge
                        className={cn(
                          "gap-1 px-3 py-1",
                          statusConfig[selectedOrder.status as OrderStatus]
                            ?.color,
                        )}
                      >
                        {
                          statusConfig[selectedOrder.status as OrderStatus]
                            ?.label
                        }
                      </Badge>
                    </div>
                  </DialogHeader>

                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Order Type</p>
                      <p className="font-medium capitalize">
                        {selectedOrder.orderType?.toLowerCase()}
                      </p>
                    </div>
                    {selectedOrder.tableNumber && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">Table Number</p>
                        <p className="font-medium">
                          {selectedOrder.tableNumber}
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Ordered At</p>
                      <p className="font-medium">
                        {format(new Date(selectedOrder.createdAt), "PPP p")}
                      </p>
                    </div>
                    {selectedOrder.estimatedReadyTime && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">Estimated Ready</p>
                        <p className="font-medium">
                          {format(
                            new Date(selectedOrder.estimatedReadyTime),
                            "p",
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Order Items
                    </h3>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {item.quantity}x {item.menuItem.name}
                            </p>
                            {item.specialInstructions && (
                              <p className="text-xs text-gray-500 mt-1">
                                Note: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                          <p className="font-semibold">Rs {item.totalPrice}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-amber-600">
                        Rs {selectedOrder.finalAmount}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for Order #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              {newStatus && (
                <div className="p-4 bg-amber-50 rounded-xl text-center">
                  <p className="text-sm text-amber-800">
                    Are you sure you want to mark this order as{" "}
                    <strong>{statusConfig[newStatus]?.label}</strong>?
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={updateOrderStatus.isPending}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {updateOrderStatus.isPending ? "Updating..." : "Confirm Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Loading Skeleton
function OrdersSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6">
        <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-5">
              <div className="flex justify-between mb-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-16 w-full mb-3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
