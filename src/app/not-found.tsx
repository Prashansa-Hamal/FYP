"use client";

import Link from "next/link";
import { ArrowLeft, Search, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Utensils className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* 404 Number */}
        <h1 className="text-8xl font-bold text-amber-500 mb-4">404</h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>

        {/* Back Button */}
        <Link href="/">
          <Button className="bg-amber-500 hover:bg-amber-600 text-white px-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Decorative Line */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            DineEase Restaurant Management System
          </p>
        </div>
      </div>
    </div>
  );
}
