"use client";

import {
  Award,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Wifi,
  Calendar,
  ShoppingBag,
  Star,
  Gift,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLoyaltyPoints } from "@/hooks/useLoyaltyPoints";

export default function LoyaltyPage() {
  const { data, isLoading, error, refetch } = useLoyaltyPoints();

  console.log("Loyalty Points Data:", data);

  if (isLoading) {
    return <LoyaltySkeleton />;
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Award className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                Unable to Load Points
              </h3>
              <p className="text-red-600 text-center mb-4">
                {error?.message || "Failed to load loyalty points"}
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="gap-2"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { points, transactions } = data.data;
  const nextRewardPoints = 1000 - points;
  const progressPercentage = Math.min((points / 1000) * 100, 100);

  // Calculate tier based on points
  const getTier = () => {
    if (points >= 5000)
      return { name: "Platinum", color: "bg-purple-500", icon: Star };
    if (points >= 2000)
      return { name: "Gold", color: "bg-yellow-500", icon: Star };
    if (points >= 1000)
      return { name: "Silver", color: "bg-gray-400", icon: Star };
    return { name: "Bronze", color: "bg-amber-600", icon: Award };
  };

  const tier = getTier();
  const TierIcon = tier.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                My Loyalty Rewards
              </h1>
              <p className="text-white/90 text-sm">
                Earn points with every order and redeem exclusive rewards
              </p>
            </div>
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
            {/* Points Overview Card */}
            <Card className="mb-6 border-0 shadow-md bg-gradient-to-r from-amber-50 to-orange-50 overflow-hidden">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left - Points Display */}
                  <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 mb-2">
                      <TierIcon className={`w-5 h-5 ${tier.color}`} />
                      <span className="text-sm font-medium text-gray-600">
                        {tier.name} Member
                      </span>
                    </div>
                    <div className="flex items-baseline justify-center md:justify-start gap-2">
                      <span className="text-5xl font-bold text-amber-600">
                        {points}
                      </span>
                      <span className="text-gray-500">points</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {nextRewardPoints > 0
                        ? `${nextRewardPoints} more points to reach next tier`
                        : "Congratulations! You've reached the highest tier!"}
                    </p>
                  </div>

                  {/* Right - Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress to Silver</span>
                      <span className="font-medium text-amber-600">
                        {points}/1000
                      </span>
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full h-3 transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Bronze</span>
                      <span>Silver</span>
                      <span>Gold</span>
                      <span>Platinum</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How to Earn Points */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                How to Earn Points
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <ShoppingBag className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Place Orders</p>
                  <p className="text-sm text-gray-500">
                    10 points per NPR 100 spent
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Calendar className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Birthday Bonus</p>
                  <p className="text-sm text-gray-500">
                    Double points on your birthday
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">
                    Reviews & Referrals
                  </p>
                  <p className="text-sm text-gray-500">
                    Earn bonus points for reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Points History */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Points History
              </h2>

              {transactions.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="py-12 text-center">
                    <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No points history yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Place your first order to start earning points!
                    </p>
                    <Link href="/menu">
                      <Button className="mt-4 bg-amber-500 hover:bg-amber-600">
                        Browse Menu
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {transaction.type === "EARNED" ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-red-500" />
                            )}
                            <p className="font-medium text-gray-900">
                              {transaction.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(
                                new Date(transaction.createdAt),
                                "MMM dd, yyyy hh:mm a",
                              )}
                            </span>
                            {transaction.order && (
                              <span className="flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3" />
                                Order #{transaction.order.orderNumber}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className={`font-bold text-lg ${
                            transaction.type === "EARNED"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "EARNED" ? "+" : "-"}
                          {transaction.points}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Redeem Points Section */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                Redeem Your Points
              </h2>
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-0">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        Exchange points for discounts
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Redeem 100 points = NPR 10 off on your next order
                      </p>
                    </div>
                    <Button
                      disabled={points < 100}
                      className="bg-amber-500 hover:bg-amber-600 text-white whitespace-nowrap"
                    >
                      Redeem Points
                    </Button>
                  </div>
                </CardContent>
              </Card>
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

// Loading Skeleton Component
function LoyaltySkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Header Skeleton */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full animate-pulse mx-auto mb-4"></div>
              <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse mx-auto mb-2"></div>
              <div className="h-4 w-64 bg-white/20 rounded-lg animate-pulse mx-auto"></div>
            </div>
          </div>

          {/* Restaurant Info Bar Skeleton */}
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Points Card Skeleton */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center md:text-left">
                  <div className="h-5 w-24 bg-gray-300 rounded animate-pulse mx-auto md:mx-0 mb-2"></div>
                  <div className="h-12 w-32 bg-gray-300 rounded animate-pulse mx-auto md:mx-0 mb-2"></div>
                  <div className="h-4 w-40 bg-gray-300 rounded animate-pulse mx-auto md:mx-0"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-3 w-full bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-3 w-full bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* How to Earn Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse mx-auto mb-2"></div>
                  <div className="h-5 w-24 bg-gray-300 rounded animate-pulse mx-auto mb-1"></div>
                  <div className="h-3 w-32 bg-gray-300 rounded animate-pulse mx-auto"></div>
                </div>
              ))}
            </div>

            {/* History Skeleton */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-48 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
