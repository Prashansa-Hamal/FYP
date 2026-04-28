// app/verify-email/page.tsx (Fixed version)
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  Phone,
  Wifi,
} from "lucide-react";
import Link from "next/link";
import { useEmailVerification } from "@/hooks/useAuthActions";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const successParam = searchParams.get("success");
  const errorParam = searchParams.get("error");

  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [message, setMessage] = useState("");

  // Use the hook to verify email if token exists and no params
  const { data, isLoading, error } = useEmailVerification(
    token && !successParam && !errorParam ? token : null,
  );

  useEffect(() => {
    // Handle direct success/error from redirect
    if (successParam === "true") {
      setVerificationStatus("success");
      setMessage(
        searchParams.get("message") ||
          "Your email has been verified successfully!",
      );
      return;
    }

    if (errorParam) {
      setVerificationStatus("error");
      setMessage(errorParam);
      return;
    }

    // Handle verification from the hook
    if (data) {
      if (data.success) {
        setVerificationStatus("success");
        setMessage(
          data.message || "Your email has been verified successfully!",
        );
      } else {
        setVerificationStatus("error");
        setMessage(data.error || "Invalid or expired verification link.");
      }
    }

    if (error) {
      setVerificationStatus("error");
      setMessage(error.message || "Verification failed. Please try again.");
    }
  }, [data, error, successParam, errorParam, searchParams]);

  // If no token and no params, redirect to home
  useEffect(() => {
    if (!token && !successParam && !errorParam) {
      router.push("/");
    }
  }, [token, successParam, errorParam, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="rounded-2xl shadow-xl overflow-hidden p-0 gap-0 space-y-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center">
            <h1 className="text-2xl font-bold">Email Verification</h1>
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

          <CardContent className="p-6 text-center">
            {verificationStatus === "loading" && (
              <>
                <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Verifying...
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email.
                </p>
              </>
            )}

            {verificationStatus === "success" && (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Email Verified!
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link href="/login">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                    Login to Your Account
                  </Button>
                </Link>
              </>
            )}

            {verificationStatus === "error" && (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="space-y-3">
                  <Link href="/resend-verification">
                    <Button variant="outline" className="w-full rounded-xl">
                      Resend Verification Email
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>

          {/* Footer */}
          <div className="text-center py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">Powered by QR Menu System</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
