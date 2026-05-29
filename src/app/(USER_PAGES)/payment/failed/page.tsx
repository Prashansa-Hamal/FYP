// "use client";

// import { useSearchParams } from "next/navigation";
// import Link from "next/link";

// export default function PaymentFailedPage() {
//   const searchParams = useSearchParams();
//   const reason = searchParams.get("reason");
//   const status = searchParams.get("status");
//   const orderId = searchParams.get("orderId");

//   const getErrorMessage = () => {
//     if (status === "User canceled" || reason === "cancelled") {
//       return "You cancelled the payment";
//     }
//     if (status === "Expired") {
//       return "Payment link has expired (60 minute limit)";
//     }
//     if (reason === "invalid_callback") {
//       return "Invalid payment callback received";
//     }
//     return "Your payment could not be processed";
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-12">
//       <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
//         <div className="text-center mb-8">
//           <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <svg
//               className="w-10 h-10 text-red-500"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M6 18L18 6M6 6l12 12"
//               ></path>
//             </svg>
//           </div>
//           <h1 className="text-3xl font-bold text-red-600 mb-2">
//             Payment Failed
//           </h1>
//           <p className="text-gray-600">{getErrorMessage()}</p>
//         </div>

//         {orderId && (
//           <div className="bg-gray-50 rounded-lg p-4 mb-8 text-center">
//             <span className="text-gray-600">Order ID: </span>
//             <span className="font-mono font-medium">{orderId}</span>
//           </div>
//         )}

//         <div className="flex gap-4">
//           <Link href="/payment" className="flex-1">
//             <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700">
//               Try Again
//             </button>
//           </Link>
//           <Link href="/" className="flex-1">
//             <button className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300">
//               Go Home
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// app/payment/failed/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  XCircle,
  MapPin,
  Phone,
  Wifi,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<PaymentFailedSkeleton />}>
      <PaymentFailedPageContent />
    </Suspense>
  );
}

interface PaymentFailedData {
  orderId?: string;
  orderNumber?: string;
  amount?: number;
  paymentMethod?: string;
  errorCode?: string;
  errorMessage?: string;
  retryUrl?: string;
}

function PaymentFailedPageContent() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentFailedData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const pidx = searchParams.get("pidx");
    const orderId = searchParams.get("orderId");
    const errorMsg = searchParams.get("error");

    // Fetch payment failure details
    const fetchPaymentDetails = async () => {
      try {
        if (pidx) {
          const response = await fetch(`/api/payment/verify?pidx=${pidx}`);
          const data = await response.json();
          setPaymentData({
            ...data.data,
            errorMessage:
              errorMsg ||
              data.message ||
              "Payment was not completed successfully.",
          });
        } else if (orderId) {
          const response = await fetch(`/api/orders/${orderId}`);
          const data = await response.json();
          setPaymentData({
            orderId: data.data.id,
            orderNumber: data.data.orderNumber,
            amount: data.data.finalAmount,
            errorMessage: errorMsg || "Payment failed. Please try again.",
          });
        } else {
          setPaymentData({
            errorMessage:
              errorMsg || "Unable to process payment. Please try again.",
          });
        }
      } catch (error) {
        setPaymentData({
          errorMessage: "Something went wrong. Please contact support.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [searchParams]);

  const handleRetry = () => {
    if (paymentData?.retryUrl) {
      window.location.href = paymentData.retryUrl;
    } else if (paymentData?.orderId) {
      window.location.href = `/checkout?orderId=${paymentData.orderId}`;
    } else {
      window.location.href = "/cart";
    }
  };

  if (isLoading) {
    return <PaymentFailedSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Error Header */}
          <div className="relative bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Payment Failed
            </h1>
            <p className="text-white/90 text-sm">
              We couldn't process your payment
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
            {/* Error Animation */}
            <div className="text-center mb-6 animate-shake">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-5">
                <p className="text-red-700 text-center font-medium">
                  {paymentData?.errorMessage ||
                    "Your payment could not be processed. Please try again or use a different payment method."}
                </p>
                {paymentData?.errorCode && (
                  <p className="text-red-600 text-sm text-center mt-2">
                    Error Code: {paymentData.errorCode}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Order Info (if available) */}
            {paymentData?.orderNumber && (
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Order Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number</span>
                    <span className="font-medium">
                      #{paymentData.orderNumber}
                    </span>
                  </div>
                  {paymentData.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-medium">
                        Rs {paymentData.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {paymentData.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="capitalize">
                        {paymentData.paymentMethod}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Common Issues */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                Common Issues & Solutions
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800">
                    Insufficient Balance
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Please check your wallet balance or try another payment
                    method.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800">Network Issue</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Check your internet connection and try again.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800">Payment Timeout</p>
                  <p className="text-sm text-gray-600 mt-1">
                    The payment session expired. Please start a new payment.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleRetry}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Link href="/cart" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Back to Cart
                </Button>
              </Link>
            </div>

            {/* Alternative Payment Options */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 text-center">
                Having trouble? Try using a different payment method or contact
                our support team at{" "}
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

function PaymentFailedSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6">
            <div className="w-20 h-20 bg-white/20 rounded-full animate-pulse mx-auto mb-4"></div>
            <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse mx-auto mb-2"></div>
            <div className="h-4 w-64 bg-white/20 rounded-lg animate-pulse mx-auto"></div>
          </div>
          <div className="p-6 space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
