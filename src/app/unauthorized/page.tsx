"use client";

import Link from "next/link";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="rounded-2xl shadow-xl overflow-hidden p-0">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-white/90 text-sm mt-1">
              You don't have permission to access this page
            </p>
          </div>

          <CardContent className="p-6 pt-0 text-center">
            <p className="text-gray-600 mb-6">
              This area is restricted to authorized personnel only. Please
              contact your administrator if you believe this is an error.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
