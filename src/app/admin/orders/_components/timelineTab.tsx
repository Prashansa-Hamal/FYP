import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/formatters";
import {
  ChefHat,
  Clock,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  Timer,
} from "lucide-react";
import { format } from "date-fns";
import { OrderDetail, OrderItem } from "@/types/orderDetails";

interface TimelineTabProps {
  order: OrderDetail;
}

export function TimelineTab({ order }: TimelineTabProps) {
  // Helper functions
  const calculatePreparationProgress = (items: OrderItem[]) => {
    const totalItems = items.length;
    const readyItems = items.filter((item) => item.isReady).length;
    return totalItems > 0 ? Math.round((readyItems / totalItems) * 100) : 0;
  };

  const getEstimatedCompletionTime = (order: OrderDetail) => {
    if (order.estimatedReadyTime) {
      return format(new Date(order.estimatedReadyTime), "hh:mm a");
    }

    const maxPrepTime = order.items.reduce((max, item) => {
      return Math.max(max, item.menuItem.preparationTime || 0);
    }, 0);

    const estimatedTime = new Date(order.createdAt);
    estimatedTime.setMinutes(estimatedTime.getMinutes() + maxPrepTime + 15);
    return format(estimatedTime, "hh:mm a");
  };

  const progress = calculatePreparationProgress(order.items);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Order Timeline
        </CardTitle>
        <CardDescription>
          Complete history of order status changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div className="space-y-8">
            {/* Created */}
            <div className="relative flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-semibold">Order Created</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Customer placed the order
                </p>
                <p className="text-sm">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            {/* Confirmed */}
            {order.status !== "PENDING" && (
              <div className="relative flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold">Order Confirmed</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Order was confirmed and preparation started
                  </p>
                  <p className="text-sm">{formatDate(order.updatedAt)}</p>
                </div>
              </div>
            )}

            {/* Items Ready Progress */}
            <div className="relative flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-semibold">Preparation</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {progress}% of items are ready
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm">
                  {order.items.filter((item) => item.isReady).length} of{" "}
                  {order.items.length} items ready
                </p>
              </div>
            </div>

            {/* Estimated Completion */}
            <div className="relative flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Timer className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-semibold">Estimated Completion</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Expected order completion time
                </p>
                <p className="text-sm font-medium">
                  {getEstimatedCompletionTime(order)}
                </p>
              </div>
            </div>

            {/* Payment Status */}
            <div className="relative flex gap-4">
              <div className="flex-shrink-0">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    order.paymentStatus === "PAID"
                      ? "bg-green-100"
                      : "bg-yellow-100"
                  }`}
                >
                  <CreditCard
                    className={`h-6 w-6 ${
                      order.paymentStatus === "PAID"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  />
                </div>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-semibold">Payment Status</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Current payment status
                </p>
                <p className="text-sm font-medium capitalize">
                  {order.paymentStatus.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
