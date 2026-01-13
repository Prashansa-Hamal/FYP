import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/formatters";
import { OrderDetail } from "@/types/orderDetails";
import {
  getOrderTypeConfig,
  getPaymentStatusConfig,
  getStatusConfig,
} from "@/utils/orders-helper";
import { format } from "date-fns";
import {
  AlertCircle,
  BarChart,
  Clock,
  CreditCard,
  DollarSign,
  Hash,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Tag,
  Timer,
  Truck,
  User,
  XCircle,
} from "lucide-react";

interface OverviewTabProps {
  order: OrderDetail;
}

export const OverviewTab = ({ order }: OverviewTabProps) => {
  // Calculate preparation progress
  const calculatePreparationProgress = () => {
    const totalItems = order.items.length;
    const readyItems = order.items.filter((item: any) => item.isReady).length;
    return totalItems > 0 ? Math.round((readyItems / totalItems) * 100) : 0;
  };

  // Calculate estimated completion time
  const getEstimatedCompletionTime = () => {
    if (order.estimatedReadyTime) {
      return format(new Date(order.estimatedReadyTime), "hh:mm a");
    }

    // Calculate based on preparation time of all items
    const maxPrepTime = order.items.reduce((max: number, item: any) => {
      return Math.max(max, item.menuItem.preparationTime || 0);
    }, 0);

    const estimatedTime = new Date(order.createdAt);
    estimatedTime.setMinutes(estimatedTime.getMinutes() + maxPrepTime + 15); // Add buffer
    return format(estimatedTime, "hh:mm a");
  };

  const statusConfig = getStatusConfig(order.status);
  const paymentStatusConfig = getPaymentStatusConfig(order.paymentStatus);
  const orderTypeConfig = getOrderTypeConfig(order.orderType);
  const progress = calculatePreparationProgress();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Order Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Order Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Summary
            </CardTitle>
            <CardDescription>Detailed breakdown of the order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Order ID:</span>
                  <span className="font-mono">{order.orderNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {orderTypeConfig.icon}
                  <span className="font-medium">Order Type:</span>
                  <Badge variant="outline" className={orderTypeConfig.color}>
                    {orderTypeConfig.label}
                  </Badge>
                  {order.tableNumber && (
                    <>
                      <span className="font-medium">Table:</span>
                      <Badge variant="outline">#{order.tableNumber}</Badge>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Payment:</span>
                  <Badge
                    className={`${paymentStatusConfig.bgColor} ${paymentStatusConfig.color} gap-1`}
                  >
                    {paymentStatusConfig.icon}
                    {paymentStatusConfig.label}
                  </Badge>
                </div>
                {order.paymentMethod && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Method:</span>
                    <Badge variant="outline">{order.paymentMethod}</Badge>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Preparation Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  <span className="font-medium">Preparation Progress</span>
                </div>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Started: {format(new Date(order.createdAt), "hh:mm a")}
                </span>
                <span>Estimated: {getEstimatedCompletionTime()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{order.user.name}</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {order.user.email}
                    </span>
                    {order.user.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {order.user.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {order.deliveryAddress && order.orderType === "DELIVERY" && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Delivery Address</span>
                  </div>
                  <div className="text-sm space-y-1 bg-gray-50 p-3 rounded-md">
                    <p>{order.deliveryAddress.street}</p>
                    <p>
                      {order.deliveryAddress.city},{" "}
                      {order.deliveryAddress.state}{" "}
                      {order.deliveryAddress.postalCode}
                    </p>
                  </div>
                </div>
              </>
            )}

            {order.specialInstructions && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Special Instructions</span>
                  </div>
                  <div className="text-sm italic bg-yellow-50 p-3 rounded-md">
                    {order.specialInstructions}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Summary & Actions */}
      <div className="space-y-6">
        {/* Amount Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Amount Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>

              {order.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">
                    {formatCurrency(order.taxAmount)}
                  </span>
                </div>
              )}

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">
                    -{formatCurrency(order.discountAmount)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span>{formatCurrency(order.finalAmount)}</span>
              </div>

              {order.payments && order.payments.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Payment History</p>
                    {order.payments.map((payment: any) => (
                      <div
                        key={payment.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {format(new Date(payment.createdAt), "hh:mm a")}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Clock className="h-4 w-4 mr-2" />
              Update Status
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Truck className="h-4 w-4 mr-2" />
              Assign Delivery
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          </CardContent>
        </Card>

        {/* Order Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Order Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Items
                </span>
                <span className="font-bold text-lg">{order.items.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Ready Items
                </span>
                <span className="font-bold text-lg text-green-600">
                  {order.items.filter((item: any) => item.isReady).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Avg. Prep Time
                </span>
                <span className="font-bold text-lg">
                  {Math.round(
                    order.items.reduce(
                      (sum: number, item: any) =>
                        sum + (item.menuItem.preparationTime || 0),
                      0
                    ) / order.items.length
                  )}{" "}
                  min
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
