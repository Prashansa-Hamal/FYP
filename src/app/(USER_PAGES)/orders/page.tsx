"use client";

import { useState, useMemo, useCallback } from "react";
import {
  MapPin,
  Phone,
  Wifi,
  Search,
  ArrowLeft,
  Clock,
  AlertCircle,
  ChefHat,
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  Coffee,
  Utensils,
  Calendar,
  CreditCard,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserOrders, useActiveOrders } from "@/hooks/useUserOrders";
import { Order, OrderFilters } from "@/types/orders";
import { OrderStatus } from "@/types/enums";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  canCancelOrder,
  CancelOrderButton,
} from "@/components/dialogs/CancelOrderDialog";

// Order Status Badge Component
const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const statusConfig = {
    PENDING: {
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    CONFIRMED: {
      label: "Confirmed",
      color: "bg-blue-100 text-blue-800",
      icon: CheckCircle2,
    },
    PREPARING: {
      label: "Preparing",
      color: "bg-orange-100 text-orange-800",
      icon: ChefHat,
    },
    READY: {
      label: "Ready",
      color: "bg-green-100 text-green-800",
      icon: Package,
    },
    SERVED: {
      label: "Served",
      color: "bg-purple-100 text-purple-800",
      icon: Coffee,
    },
    COMPLETED: {
      label: "Completed",
      color: "bg-gray-100 text-gray-800",
      icon: CheckCircle2,
    },
    CANCELLED: {
      label: "Cancelled",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={cn("px-3 py-1 font-medium", config.color)}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

// Payment Status Badge
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    PAID: { label: "Paid", color: "bg-green-100 text-green-800" },
    FAILED: { label: "Failed", color: "bg-red-100 text-red-800" },
    REFUNDED: { label: "Refunded", color: "bg-gray-100 text-gray-800" },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

  return (
    <Badge className={cn("px-3 py-1 font-medium", config.color)}>
      {config.label}
    </Badge>
  );
};

// Order Type Icon
const OrderTypeIcon = ({ type }: { type: string }) => {
  const icons = {
    DINE_IN: Utensils,
    TAKEAWAY: Package,
    DELIVERY: Truck,
  };
  const Icon = icons[type as keyof typeof icons] || Utensils;
  return <Icon className="w-4 h-4" />;
};

// Order Card Component
const OrderCard = ({ order }: { order: Order }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Order Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
              <Receipt className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Order #{order.orderNumber}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                <Clock className="w-3 h-3 ml-1" />
                <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <OrderStatusBadge status={order.status as OrderStatus} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <OrderTypeIcon type={order.orderType} />
            <span className="capitalize">
              {order.orderType.toLowerCase().replace("_", " ")}
            </span>
            {order.tableNumber && (
              <>
                <span className="text-gray-300">•</span>
                <span>Table {order.tableNumber}</span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          >
            {expanded ? "Show less" : "View details"}
          </Button>
        </div>

        {/* Order Items Preview */}
        <div className="space-y-2">
          {order.items.slice(0, expanded ? undefined : 2).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{item.quantity}x</span>
                <span className="text-gray-700">{item.menuItem.name}</span>
              </div>
              <span className="text-gray-900 font-medium">
                Rs {item.totalPrice}
              </span>
            </div>
          ))}
          {!expanded && order.items.length > 2 && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-amber-600 hover:text-amber-700"
            >
              + {order.items.length - 2} more items
            </button>
          )}
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {/* All Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Items</h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-gray-400">{item.quantity}x</span>
                      <span className="text-gray-700">
                        {item.menuItem.name}
                      </span>
                      {item.specialInstructions && (
                        <span className="text-xs text-gray-400 italic">
                          ({item.specialInstructions})
                        </span>
                      )}
                    </div>
                    <span className="text-gray-900 font-medium">
                      Rs {item.totalPrice}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Info */}
            {order.payments.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Payment</h4>
                <div className="space-y-1 text-sm">
                  {order.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between">
                      <span className="text-gray-600 capitalize">
                        {payment.paymentMethod.toLowerCase()}
                      </span>
                      <span className="text-gray-900">Rs {payment.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Delivery Address
                </h4>
                <p className="text-sm text-gray-600">
                  {order.deliveryAddress.street}, {order.deliveryAddress.city},{" "}
                  {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                </p>
              </div>
            )}

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Special Instructions
                </h4>
                <p className="text-sm text-gray-600">
                  {order.specialInstructions}
                </p>
              </div>
            )}

            {/* Order Timeline */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
              <div className="space-y-2 text-sm">
                {order.estimatedReadyTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Ready</span>
                    <span className="text-gray-900">
                      {new Date(order.estimatedReadyTime).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {order.readyAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ready At</span>
                    <span className="text-gray-900">
                      {new Date(order.readyAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {order.servedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Served At</span>
                    <span className="text-gray-900">
                      {new Date(order.servedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {order.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed At</span>
                    <span className="text-gray-900">
                      {new Date(order.completedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Order Total */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Total Amount</span>
            <div className="text-right">
              {order.discountAmount > 0 && (
                <div className="text-sm text-gray-400 line-through">
                  Rs {order.totalAmount}
                </div>
              )}
              <div className="text-lg font-bold text-amber-600">
                Rs {order.finalAmount}
              </div>
            </div>
          </div>
          {order.discountAmount > 0 && (
            <div className="text-xs text-green-600 mt-1">
              Saved Rs {order.discountAmount}
            </div>
          )}

          {canCancelOrder(order.status as OrderStatus) ? (
            <CancelOrderButton
              id={order.id}
              orderNumber={order.orderNumber}
              currentStatus={order.status as OrderStatus}
            />
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton
const OrderSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>
    <Skeleton className="h-16 w-full mb-3" />
    <Skeleton className="h-10 w-full" />
  </div>
);

// Empty State Component
const EmptyState = ({ type }: { type: "active" | "history" }) => (
  <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
    <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
      {type === "active" ? (
        <Package className="w-12 h-12 text-amber-400" />
      ) : (
        <Receipt className="w-12 h-12 text-amber-400" />
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-2">
      {type === "active" ? "No Active Orders" : "No Order History"}
    </h3>
    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
      {type === "active"
        ? "You don't have any active orders at the moment. Browse our menu and place your first order!"
        : "Your order history will appear here once you've placed some orders."}
    </p>
    <Button
      onClick={() => (window.location.href = "/")}
      className="bg-amber-500 hover:bg-amber-600 text-white"
    >
      Browse Menu
    </Button>
  </div>
);

// Main Component
export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 10,
  });

  // Fetch active orders
  const { data: activeOrders, isLoading: loadingActive } = useActiveOrders(10);

  // Fetch order history
  const { data: historyOrders, isLoading: loadingHistory } = useUserOrders({
    page: filters.page,
    limit: filters.limit,
    status: ["COMPLETED", "CANCELLED"],
  });

  console.log("activeOrders", activeOrders);
  console.log("historyOrders", historyOrders);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl sm:rounded-t-none shadow-xl overflow-hidden">
          {/* Hero Section */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format"
              alt="Restaurant interior"
              className="w-full h-48 sm:h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                My Orders
              </h1>
              <p className="text-white/90 text-sm">
                Track and manage your orders
              </p>
            </div>
          </div>

          {/* Restaurant Info Bar */}
          <div className="bg-gray-50/80 border-b border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">
                  123 Main Street, Kathmandu
                </span>
                <span className="sm:hidden">Kathmandu</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>+977 9801234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">WiFi: DineEase</span>
                <span className="sm:hidden">WiFi</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 pt-4">
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "active" | "history")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-white data-[state=active]:text-amber-600 rounded-lg transition-all"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Active Orders
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-white data-[state=active]:text-amber-600 rounded-lg transition-all"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Order History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-4 space-y-4">
                {loadingActive ? (
                  <>
                    <OrderSkeleton />
                    <OrderSkeleton />
                  </>
                ) : activeOrders?.data.length === 0 ? (
                  <EmptyState type="active" />
                ) : (
                  activeOrders?.data.map((order: any) => (
                    <OrderCard key={order.id} order={order} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-4 space-y-4">
                {loadingHistory ? (
                  <>
                    <OrderSkeleton />
                    <OrderSkeleton />
                  </>
                ) : historyOrders?.data.length === 0 ? (
                  <EmptyState type="history" />
                ) : (
                  <>
                    {historyOrders?.data.map((order: any) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 pb-6 border-t border-gray-100">
            <p className="text-xs text-gray-400">Powered by QR Menu System</p>
          </div>
        </div>
      </div>
    </div>
  );
}
