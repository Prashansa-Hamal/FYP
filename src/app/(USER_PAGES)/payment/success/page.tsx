// "use client";

// import { useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { useEffect, useState } from "react";

// export default function PaymentSuccessPage() {
//   const searchParams = useSearchParams();
//   const [payment, setPayment] = useState({
//     orderId: searchParams.get("orderId") || "",
//     transactionId: searchParams.get("transactionId") || "",
//     amount: searchParams.get("amount") || "0",
//     pidx: searchParams.get("pidx") || "",
//   });

//   useEffect(() => {
//     console.log("✅ Payment success:", payment);
//     // Optional: Call lookup API for final verification
//     const verifyWithLookup = async () => {
//       if (payment.pidx) {
//         try {
//           const response = await fetch("/api/khalti/lookup", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               pidx: payment.pidx,
//               orderId: payment.orderId,
//             }),
//           });
//           const data = await response.json();
//           console.log("🔍 Lookup verification:", data);
//         } catch (error) {
//           console.error("Lookup error:", error);
//         }
//       }
//     };
//     verifyWithLookup();
//   }, [payment]);

//   return (
//     <div className="min-h-screen bg-gray-50 py-12">
//       <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
//         {/* Success Icon */}
//         <div className="text-center mb-8">
//           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <svg
//               className="w-10 h-10 text-green-500"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M5 13l4 4L19 7"
//               ></path>
//             </svg>
//           </div>
//           <h1 className="text-3xl font-bold text-green-600 mb-2">
//             Payment Successful!
//           </h1>
//           <p className="text-gray-600">Your transaction has been completed</p>
//         </div>

//         {/* Payment Details */}
//         <div className="bg-gray-50 rounded-lg p-6 mb-8 space-y-3">
//           <div className="flex justify-between border-b pb-2">
//             <span className="text-gray-600">Order ID:</span>
//             <span className="font-mono font-medium">{payment.orderId}</span>
//           </div>
//           <div className="flex justify-between border-b pb-2">
//             <span className="text-gray-600">Transaction ID:</span>
//             <span className="font-mono font-medium">
//               {payment.transactionId}
//             </span>
//           </div>
//           <div className="flex justify-between pt-2">
//             <span className="text-lg font-semibold">Amount Paid:</span>
//             <span className="text-2xl font-bold text-purple-600">
//               NPR {payment.amount}
//             </span>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-4">
//           <Link href="/orders" className="flex-1">
//             <button className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300">
//               View Orders
//             </button>
//           </Link>
//           <Link href="/" className="flex-1">
//             <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700">
//               Continue Shopping
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// app/payment/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  MapPin,
  Phone,
  Wifi,
  Package,
  Clock,
  Calendar,
  CreditCard,
  Receipt,
  ArrowRight,
  Download,
  Printer,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PaymentSuccessData {
  orderId: string;
  orderNumber: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
  orderDetails: {
    orderType: string;
    tableNumber?: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    taxAmount: number;
    finalAmount: number;
  };
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pidx = searchParams.get("pidx");
    const orderId = searchParams.get("orderId");

    if (!pidx && !orderId) {
      setError("No payment information found");
      setIsLoading(false);
      return;
    }

    // Fetch payment details from your API
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(
          `/api/payment/verify?pidx=${pidx}&orderId=${orderId}`,
        );
        const data = await response.json();

        if (data.success) {
          setPaymentData(data.data);
        } else {
          setError(data.message || "Failed to verify payment");
        }
      } catch (err) {
        setError("Something went wrong. Please contact support.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Payment Successful",
        text: `Payment for order #${paymentData?.orderNumber} was successful!`,
        url: window.location.href,
      });
    }
  };

  const handleDownloadReceipt = () => {
    // Implement receipt download logic
    toast.success("Receipt downloaded");
  };

  if (isLoading) {
    return <PaymentSuccessSkeleton />;
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Unable to Verify Payment
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "Please check your order status in your account."}
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

          <div className="p-6">
            {/* Success Animation */}
            <div className="text-center mb-6 animate-bounce">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Payment Info Card */}
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-green-700 mb-1">Amount Paid</p>
                    <p className="text-3xl font-bold text-green-700">
                      Rs {paymentData.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-700 mb-1">
                      Transaction ID
                    </p>
                    <p className="font-mono text-sm text-green-700">
                      {paymentData.transactionId}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    #{paymentData.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order Type</span>
                  <span className="capitalize">
                    {paymentData.orderDetails.orderType
                      .toLowerCase()
                      .replace("_", " ")}
                  </span>
                </div>
                {paymentData.orderDetails.tableNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Table Number</span>
                    <span>{paymentData.orderDetails.tableNumber}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="capitalize">
                    {paymentData.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Date</span>
                  <span>
                    {format(new Date(paymentData.paymentDate), "PPP p")}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-2">
                {paymentData.orderDetails.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {item.quantity}x {item.name}
                      </p>
                    </div>
                    <p className="font-semibold">
                      Rs {item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-amber-50 rounded-xl p-5 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>Rs {paymentData.orderDetails.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (13%)</span>
                  <span>Rs {paymentData.orderDetails.taxAmount}</span>
                </div>
                <div className="border-t border-amber-200 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total Paid</span>
                    <span className="text-amber-600">
                      Rs {paymentData.orderDetails.finalAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/orders" className="flex-1">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  View My Orders
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/menu" className="flex-1">
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
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
