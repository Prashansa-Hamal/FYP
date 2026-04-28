"use client";

import { useLoyaltyPoints } from "@/hooks/useLoyaltyPoints";
import { Award, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function LoyaltyPointsCard() {
  const { data, isLoading, error } = useLoyaltyPoints();

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-16" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.success) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 text-center">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Unable to load loyalty points</p>
        </CardContent>
      </Card>
    );
  }

  const { points, transactions } = data.data;

  return (
    <Card className="border-0 shadow-md bg-gradient-to-r from-amber-50 to-orange-50">
      <CardContent className="p-6">
        {/* Points Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900">Loyalty Points</h3>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-amber-600">{points}</span>
            <p className="text-xs text-gray-500">total points</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-amber-200 rounded-full h-2">
            <div
              className="bg-amber-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${Math.min((points / 1000) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {1000 - points} points until next reward
          </p>
        </div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Recent Activity
            </h4>
            <div className="space-y-2">
              {transactions.slice(0, 3).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex-1">
                    <p className="text-gray-600">{transaction.description}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(transaction.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <span
                    className={`font-medium ${transaction.type === "EARNED" ? "text-green-600" : "text-red-600"}`}
                  >
                    {transaction.type === "EARNED" ? "+" : "-"}
                    {transaction.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
