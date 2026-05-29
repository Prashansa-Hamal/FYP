// app/payment/success/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  MapPin,
  Phone,
  Wifi,
  ArrowRight,
  Printer,
  Share2,
  Receipt,
  Clock,
  Calendar,
  User,
  Mail,
  ShoppingBag,
  CreditCard,
  Home,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import { useOrderDetail } from "@/hooks/useOrders";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessSkeleton />}>
      <PaymentSuccessPageContent />
    </Suspense>
  );
}

interface PaymentData {
  orderId: string;
  transactionId: string;
  amount: number;
  pidx?: string;
  paymentMethod: "khalti" | "esewa" | "unknown";
}

function PaymentSuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentData>({
    orderId: "",
    transactionId: "",
    amount: 0,
    pidx: "",
    paymentMethod: "unknown",
  });

  // Get orderId from URL and fetch order details
  const orderId = searchParams.get("orderId") || payment.orderId;
  const {
    data: order,
    isLoading: isOrderLoading,
    error: orderError,
  } = useOrderDetail(orderId || "");

  useEffect(() => {
    // Get parameters from URL (works for both Khalti and eSewa)
    const pidx = searchParams.get("pidx"); // Khalti parameter
    const orderIdParam = searchParams.get("orderId");
    const transactionId =
      searchParams.get("transactionId") || searchParams.get("refId"); // Khalti uses refId
    const amount = searchParams.get("amount");
    const method = searchParams.get("method");

    // Determine payment method
    let paymentMethod: "khalti" | "esewa" | "unknown" = "unknown";
    if (pidx) paymentMethod = "khalti";
    else if (method === "esewa" || transactionId?.startsWith("ESEWA"))
      paymentMethod = "esewa";
    else if (method === "khalti") paymentMethod = "khalti";

    setPayment({
      orderId: orderIdParam || "",
      transactionId: transactionId || "",
      amount: amount ? parseFloat(amount) : 0,
      pidx: pidx || "",
      paymentMethod,
    });

    console.log("Payment success page loaded with:", {
      pidx,
      orderId: orderIdParam,
      transactionId,
      amount,
      paymentMethod,
    });
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Payment Successful",
        text: `Payment for order #${order?.orderNumber || payment.orderId} was successful!`,
        url: window.location.href,
      });
    } else {
      toast.success("Payment successful!");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      CONFIRMED: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      PREPARING: { color: "bg-purple-100 text-purple-800", label: "Preparing" },
      READY: { color: "bg-indigo-100 text-indigo-800", label: "Ready" },
      SERVED: { color: "bg-green-100 text-green-800", label: "Served" },
      COMPLETED: { color: "bg-green-100 text-green-800", label: "Completed" },
      CANCELLED: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };
    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };
    return (
      <Badge className={`${config.color} font-medium`}>{config.label}</Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      PAID: { color: "bg-green-100 text-green-800", label: "Paid" },
      FAILED: { color: "bg-red-100 text-red-800", label: "Failed" },
      REFUNDED: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
    };
    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };
    return (
      <Badge className={`${config.color} font-medium`}>{config.label}</Badge>
    );
  };

  // Show loading state
  if (isOrderLoading) {
    return <PaymentSuccessSkeleton />;
  }

  // Show error if order not found
  if (orderError || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-10 h-10 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              Please check your order status in your account.
            </p>
            <Link href="/orders">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                View My Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Success Header */}
          <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
            <div className="absolute top-4 right-4">
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Payment Successful!
            </h1>
            <p className="text-white/90 text-sm">
              Your payment has been processed successfully
            </p>
          </div>

          {/* Restaurant Info Bar */}
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600 flex-wrap gap-2">
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

          <div className="p-6">
            {/* Payment Info Card */}
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-green-700 mb-1">Amount Paid</p>
                    <p className="text-3xl font-bold text-green-700">
                      Rs {order.finalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-700 mb-1">
                      Transaction ID
                    </p>
                    <p className="font-mono text-sm text-green-700 break-all">
                      {payment.transactionId ||
                        order.payments?.[0]?.transactionId ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Order Status</p>
                      <div className="mt-1">{getStatusBadge(order.status)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Status</p>
                      <div className="mt-1">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Details */}
            <div className="space-y-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-500" />
                Order Details
              </h2>

              <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-semibold text-gray-900">
                    #{order.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order Type</span>
                  <span className="capitalize">
                    {order.orderType.toLowerCase().replace("_", " ")}
                  </span>
                </div>
                {order.tableNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Table Number</span>
                    <span>{order.tableNumber}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="capitalize font-medium">
                    {order.paymentMethod?.toLowerCase() ||
                      payment.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Date</span>
                  <span>{format(new Date(order.createdAt), "PPP p")}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            {order.user && (
              <div className="space-y-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" />
                  Customer Information
                </h2>
                <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Name</span>
                    <span className="font-medium">{order.user.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email</span>
                    <span>{order.user.email}</span>
                  </div>
                  {order.user.phone && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phone</span>
                      <span>{order.user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                Order Items
              </h2>
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.quantity}x {item.menuItem?.name || "Item"}
                        </p>
                        {item.specialInstructions && (
                          <p className="text-xs text-gray-500 mt-1">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">
                        Rs {item.totalPrice}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-amber-50 rounded-xl p-5 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>Rs {order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (13%)</span>
                  <span>Rs {order.taxAmount}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">
                      -Rs {order.discountAmount}
                    </span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total Paid</span>
                  <span className="text-amber-600 text-lg">
                    Rs {order.finalAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/orders`} className="flex-1">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  View Order Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>

            {/* Help Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-600">
                Need help? Contact our support team at{" "}
                <a
                  href="tel:+9779801234567"
                  className="text-amber-600 font-medium"
                >
                  +977 9801234567
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">Powered by QR Menu System</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeletons
function PaymentSuccessSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
            <div className="w-20 h-20 bg-white/20 rounded-full animate-pulse mx-auto mb-4"></div>
            <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse mx-auto mb-2"></div>
            <div className="h-4 w-64 bg-white/20 rounded-lg animate-pulse mx-auto"></div>
          </div>
          <div className="p-6 space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
