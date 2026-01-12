"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CreditCard,
  Edit,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
  User,
  Utensils,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Hash,
  Mail,
  Phone,
  ChefHat,
  Martini,
  Leaf,
  Timer,
  BarChart,
} from "lucide-react";
import { format } from "date-fns";
import { IconPepper } from "@tabler/icons-react";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { useOrderDetail } from "@/hooks/useOrders";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { OrderDetailsSkeleton } from "@/components/skeletons/orderDetailsSkeleton";
import NotFoundComponent from "@/components/not-found";
import { OrderStatus } from "@/generated/prisma/enums";
import { toast } from "sonner";

export function OrderDetailsClient({ id }: { id: string }) {
  const { data, isLoading, isError } = useOrderDetail(id);

  const order = data?.data!;
  if (isLoading) return <OrderDetailsSkeleton />;
  if (isError) return <NotFoundComponent />;

  // Calculate preparation progress
  const calculatePreparationProgress = () => {
    const totalItems = order.items.length;
    const readyItems = order.items.filter((item: any) => item.isReady).length;
    return totalItems > 0 ? Math.round((readyItems / totalItems) * 100) : 0;
  };

  // Get status configuration
  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { label: string; icon: React.ReactNode; color: string; bgColor: string }
    > = {
      PENDING: {
        label: "Pending",
        icon: <Clock className="h-4 w-4" />,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      },
      CONFIRMED: {
        label: "Confirmed",
        icon: <ShieldCheck className="h-4 w-4" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      PREPARING: {
        label: "Preparing",
        icon: <ChefHat className="h-4 w-4" />,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
      READY: {
        label: "Ready",
        icon: <Package className="h-4 w-4" />,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      SERVED: {
        label: "Served",
        icon: <Truck className="h-4 w-4" />,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
      },
      COMPLETED: {
        label: "Completed",
        icon: <CheckCircle className="h-4 w-4" />,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      CANCELLED: {
        label: "Cancelled",
        icon: <XCircle className="h-4 w-4" />,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
    };
    return (
      configs[status] || {
        label: status,
        icon: <AlertCircle className="h-4 w-4" />,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      }
    );
  };

  // Get payment status configuration
  const getPaymentStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { label: string; icon: React.ReactNode; color: string; bgColor: string }
    > = {
      PENDING: {
        label: "Pending",
        icon: <Clock className="h-4 w-4" />,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      },
      PROCESSING: {
        label: "Processing",
        icon: <RefreshCw className="h-4 w-4" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      COMPLETED: {
        label: "Paid",
        icon: <CheckCircle className="h-4 w-4" />,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      FAILED: {
        label: "Failed",
        icon: <XCircle className="h-4 w-4" />,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
      REFUNDED: {
        label: "Refunded",
        icon: <RefreshCw className="h-4 w-4" />,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
    };
    return (
      configs[status] || {
        label: status,
        icon: <AlertCircle className="h-4 w-4" />,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      }
    );
  };

  // Get order type configuration
  const getOrderTypeConfig = (type: string) => {
    const configs: Record<
      string,
      { label: string; icon: React.ReactNode; color: string }
    > = {
      DINE_IN: {
        label: "Dine In",
        icon: <Utensils className="h-4 w-4" />,
        color: "bg-blue-100 text-blue-800",
      },
      TAKEAWAY: {
        label: "Takeaway",
        icon: <ShoppingBag className="h-4 w-4" />,
        color: "bg-green-100 text-green-800",
      },
      DELIVERY: {
        label: "Delivery",
        icon: <Truck className="h-4 w-4" />,
        color: "bg-purple-100 text-purple-800",
      },
    };
    return (
      configs[type] || {
        label: type,
        icon: <Package className="h-4 w-4" />,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  // Get item badge based on properties
  const getItemBadges = (item: any) => {
    const badges = [];
    if (item.menuItem.isVegetarian)
      badges.push({
        icon: <Leaf className="h-3 w-3" />,
        text: "Veg",
        color: "bg-green-100 text-green-800",
      });
    if (item.menuItem.isSpicy)
      badges.push({
        icon: <IconPepper className="h-3 w-3" />,
        text: "Spicy",
        color: "bg-red-100 text-red-800",
      });
    if (item.menuItem.isAlcoholic)
      badges.push({
        icon: <Martini className="h-3 w-3" />,
        text: "Alcoholic",
        color: "bg-purple-100 text-purple-800",
      });
    return badges;
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

  // Prepare invoice items
  const invoiceItems = order.items.map((item: any) => ({
    id: item.id,
    name: item.menuItem.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    specialInstructions: item.specialInstructions,
  }));

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Order #{order.orderNumber}
              <Badge
                className={`${statusConfig.bgColor} ${statusConfig.color} gap-1`}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <InvoicePreview
            orderNumber={order.orderNumber}
            orderDate={order.createdAt}
            customerName={order.user.name}
            customerEmail={order.user.email}
            customerPhone={order.user.phone}
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
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Status
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Order Items</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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
                  <CardDescription>
                    Detailed breakdown of the order
                  </CardDescription>
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
                        <Badge
                          variant="outline"
                          className={orderTypeConfig.color}
                        >
                          {orderTypeConfig.label}
                        </Badge>
                        {order.tableNumber && (
                          <>
                            <span className="font-medium">Table:</span>
                            <Badge variant="outline">
                              #{order.tableNumber}
                            </Badge>
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
                        <span className="font-medium">
                          Preparation Progress
                        </span>
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
                          <span className="font-medium">
                            Special Instructions
                          </span>
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
                      <span className="font-bold text-lg">
                        {order.items.length}
                      </span>
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
        </TabsContent>

        {/* Order Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Order Items ({order.items.length})
              </CardTitle>
              <CardDescription>
                All items ordered with preparation status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => {
                  const badges = getItemBadges(item);
                  const isReady = item.isReady;

                  return (
                    <div
                      key={item.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  isReady
                                    ? "bg-green-100 text-green-600"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {isReady ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : (
                                  <Clock className="h-5 w-5" />
                                )}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">
                                  {item.menuItem.name}
                                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                                    #{index + 1}
                                  </span>
                                </h3>
                                <div className="flex gap-1">
                                  {badges.map((badge, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className={badge.color}
                                    >
                                      {badge.icon}
                                      <span className="ml-1">{badge.text}</span>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.menuItem.description}
                              </p>
                              <div className="flex flex-wrap gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <ChefHat className="h-3 w-3" />
                                  {item.menuItem.preparationStation.replace(
                                    "_",
                                    " "
                                  )}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Timer className="h-3 w-3" />
                                  {item.menuItem.preparationTime} min
                                </span>
                                <span className="flex items-center gap-1">
                                  {formatCurrency(item.unitPrice)} each
                                </span>
                              </div>
                            </div>
                          </div>

                          {item.specialInstructions && (
                            <div className="mt-3 ml-13 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                              <p className="text-sm font-medium flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Special Instructions
                              </p>
                              <p className="text-sm mt-1 italic">
                                {item.specialInstructions}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="sm:text-right">
                          <div className="space-y-2">
                            <div className="text-2xl font-bold">
                              {formatCurrency(item.totalPrice)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity} × {formatCurrency(item.unitPrice)}
                            </div>
                            <div className="flex sm:justify-end gap-2">
                              <Badge variant={isReady ? "default" : "outline"}>
                                {isReady ? "Ready" : "Preparing"}
                              </Badge>
                              {item.readyAt && (
                                <Badge variant="outline" className="text-xs">
                                  Ready at:{" "}
                                  {format(new Date(item.readyAt), "hh:mm a")}
                                </Badge>
                              )}
                            </div>
                            {!isReady && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                {isReady
                                  ? "Mark as Not Ready"
                                  : "Mark as Ready"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment History
              </CardTitle>
              <CardDescription>
                All payment transactions for this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              {order.payments && order.payments.length > 0 ? (
                <div className="space-y-4">
                  {order.payments.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                payment.status === "COMPLETED"
                                  ? "bg-green-100"
                                  : payment.status === "PENDING"
                                  ? "bg-yellow-100"
                                  : "bg-red-100"
                              }`}
                            >
                              <CreditCard
                                className={`h-5 w-5 ${
                                  payment.status === "COMPLETED"
                                    ? "text-green-600"
                                    : payment.status === "PENDING"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {payment.method} Payment
                                {payment.transactionId && (
                                  <span className="ml-2 text-sm font-mono text-muted-foreground">
                                    ({payment.transactionId.slice(0, 8)})
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(payment.createdAt), "PPpp")}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <div className="text-2xl font-bold">
                            {formatCurrency(payment.amount)}
                          </div>
                          <Badge
                            className={
                              payment.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Payments Found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    No payment transactions have been recorded for this order.
                  </p>
                  <Button>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Process Payment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
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
                {/* Timeline line */}
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
                        {order.items.filter((item: any) => item.isReady).length}{" "}
                        of {order.items.length} items ready
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
                        {getEstimatedCompletionTime()}
                      </p>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="relative flex gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          order.paymentStatus === "COMPLETED"
                            ? "bg-green-100"
                            : "bg-yellow-100"
                        }`}
                      >
                        <CreditCard
                          className={`h-6 w-6 ${
                            order.paymentStatus === "COMPLETED"
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
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Update Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Update Order Status
                </CardTitle>
                <CardDescription>
                  Change the current status of this order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select New Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "PENDING",
                      "CONFIRMED",
                      "PREPARING",
                      "READY",
                      "SERVED",
                      "COMPLETED",
                      "CANCELLED",
                    ].map((status) => {
                      const config = getStatusConfig(status);
                      return (
                        <Button
                          key={status}
                          variant={
                            order.status === status ? "default" : "outline"
                          }
                          className="justify-start"
                        >
                          {config.icon}
                          {config.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                <Button className="w-full">Update Status</Button>
              </CardContent>
            </Card>

            {/* Process Payment Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Process Payment
                </CardTitle>
                <CardDescription>
                  Record a payment for this order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Amount</label>
                    <div className="text-2xl font-bold mt-1">
                      {formatCurrency(order.finalAmount)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {["CASH", "CARD", "ONLINE", "WALLET"].map((method) => (
                        <Button key={method} variant="outline">
                          {method}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full">Process Payment</Button>
                </div>
              </CardContent>
            </Card>

            {/* Assign Staff Card */}
            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Assign Staff
                </CardTitle>
                <CardDescription>
                  Assign staff to prepare or deliver this order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select Staff Member
                  </label>
                  <div className="space-y-2">
                    {[
                      "Chef John",
                      "Chef Maria",
                      "Server Mike",
                      "Delivery Alex",
                    ].map((staff) => (
                      <Button
                        key={staff}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        {staff}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button className="w-full">Assign Staff</Button>
              </CardContent>
            </Card> */}

            {/* Cancel Order Card */}
            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Cancel Order
                </CardTitle>
                <CardDescription>Cancel this order with reason</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Cancellation Reason
                  </label>
                  <textarea
                    className="w-full min-h-[100px] p-3 border rounded-md"
                    placeholder="Enter reason for cancellation..."
                  />
                </div>
                <Button variant="destructive" className="w-full">
                  Cancel Order
                </Button>
              </CardContent>
            </Card> */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
