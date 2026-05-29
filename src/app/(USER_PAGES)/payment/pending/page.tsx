"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Phone,
  Wifi,
  Loader2,
  CreditCard,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={<PaymentPendingSkeleton />}>
      <PaymentPendingPageContent />
    </Suspense>
  );
}

interface PaymentPendingData {
  orderId: string;
  orderNumber: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  initiatedAt: string;
  expiresAt?: string;
  status: "PENDING" | "PROCESSING" | "VERIFYING";
}

function PaymentPendingPageContent() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentPendingData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const pidx = searchParams.get("pidx");
    const orderId = searchParams.get("orderId");

    if (!pidx && !orderId) {
      setIsLoading(false);
      return;
    }

    const fetchPaymentStatus = async () => {
      try {
        const response = await fetch(
          `/api/payment/status?pidx=${pidx}&orderId=${orderId}`,
        );
        const data = await response.json();

        if (data.success) {
          setPaymentData(data.data);

          // Start polling if status is pending
          if (data.data.status === "PENDING") {
            startPolling(pidx, orderId);
          }
        }
      } catch (error) {
        console.log("Error fetching payment status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [searchParams]);

  const startPolling = (pidx: string | null, orderId: string | null) => {
    let attempts = 0;
    const maxAttempts = 20; // 20 attempts * 3 seconds = 60 seconds

    const interval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(
          `/api/payment/status?pidx=${pidx}&orderId=${orderId}`,
        );
        const data = await response.json();

        if (data.success && data.data.status !== "PENDING") {
          clearInterval(interval);
          if (data.data.status === "SUCCESS") {
            window.location.href = `/payment/success?orderId=${orderId}`;
          } else if (data.data.status === "FAILED") {
            window.location.href = `/payment/failed?orderId=${orderId}`;
          }
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      } catch (error) {
        console.log("Polling error:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (paymentData?.expiresAt) {
      const updateTimeRemaining = () => {
        const expiry = new Date(paymentData.expiresAt as any);
        const now = new Date();
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeRemaining("Expired");
          return;
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      };

      updateTimeRemaining();
      const timer = setInterval(updateTimeRemaining, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentData]);

  const handleVerifyManually = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(
        `/api/payment/verify?orderId=${paymentData?.orderId}`,
      );
      const data = await response.json();

      if (data.success && data.data.status === "SUCCESS") {
        window.location.href = `/payment/success?orderId=${paymentData?.orderId}`;
      } else if (data.data.status === "FAILED") {
        window.location.href = `/payment/failed?orderId=${paymentData?.orderId}`;
      } else {
        alert("Payment still processing. Please wait a moment.");
      }
    } catch (error) {
      alert("Failed to verify payment. Please check your order status later.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return <PaymentPendingSkeleton />;
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Payment Information
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find any pending payment details.
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Pending Header */}
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Payment Processing
            </h1>
            <p className="text-white/90 text-sm">
              Please wait while we confirm your payment
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
            {/* Processing Animation */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full animate-pulse">
                <CreditCard className="w-10 h-10 text-amber-600" />
              </div>
            </div>

            {/* Status Message */}
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardContent className="p-5 text-center">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
                <p className="text-amber-800 font-medium">
                  {paymentData.status === "PROCESSING"
                    ? "Processing your payment..."
                    : "Waiting for payment confirmation..."}
                </p>
                {timeRemaining && (
                  <p className="text-amber-700 text-sm mt-2">
                    Time remaining:{" "}
                    <span className="font-mono font-bold">{timeRemaining}</span>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Order Info */}
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium">
                    Rs {paymentData.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="capitalize font-medium">
                    {paymentData.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Initiated At</span>
                  <span>
                    {format(new Date(paymentData.initiatedAt), "hh:mm:ss a")}
                  </span>
                </div>
                {paymentData.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-mono text-sm">
                      {paymentData.transactionId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                What's happening?
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    1. Your payment request has been sent to{" "}
                    {paymentData.paymentMethod}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    2. Please complete the payment in your{" "}
                    {paymentData.paymentMethod} app
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    3. We'll automatically confirm your payment once completed
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleVerifyManually}
                disabled={isVerifying}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check Payment Status
                  </>
                )}
              </Button>
              <Link href="/orders" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  View Orders
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Note */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Do not close this page while payment is
                processing.
                <br />
                You will be automatically redirected once payment is confirmed.
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

function PaymentPendingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
            <div className="w-20 h-20 bg-white/20 rounded-full animate-pulse mx-auto mb-4"></div>
            <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse mx-auto mb-2"></div>
            <div className="h-4 w-64 bg-white/20 rounded-lg animate-pulse mx-auto"></div>
          </div>
          <div className="p-6 space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
