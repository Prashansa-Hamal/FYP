"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserLoyaltyStats } from "@/hooks/useLoyaltyStats";
import { Award, TrendingUp, Trophy, Medal } from "lucide-react";

export function UserLoyaltyChart() {
  const { data, isLoading, error } = useUserLoyaltyStats();

  if (isLoading) {
    return <UserLoyaltySkeleton />;
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-500">
          Failed to load your loyalty statistics
        </CardContent>
      </Card>
    );
  }

  const { summary, monthlyHistory, recentTransactions, rank } = data;

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return <Trophy className="w-6 h-6 text-purple-500" />;
      case "Gold":
        return <Medal className="w-6 h-6 text-yellow-500" />;
      case "Silver":
        return <Medal className="w-6 h-6 text-gray-400" />;
      default:
        return <Award className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tier Card */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Current Tier</p>
              <div className="flex items-center gap-2">
                {getTierIcon(summary.tier)}
                <h2 className="text-2xl font-bold text-gray-900">
                  {summary.tier}
                </h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Points</p>
              <p className="text-3xl font-bold text-amber-600">
                {summary.currentBalance.toLocaleString()}
              </p>
            </div>
          </div>

          {summary.nextTierPoints > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {summary.nextTierPoints} points to reach next tier
                </span>
                <span className="text-amber-600">
                  {summary.progressToNextTier}%
                </span>
              </div>
              <Progress value={summary.progressToNextTier} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earned</p>
                <p className="text-xl font-bold text-green-600">
                  +{summary.totalEarned.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Redeemed</p>
                <p className="text-xl font-bold text-red-600">
                  -{summary.totalRedeemed.toLocaleString()}
                </p>
              </div>
              <Award className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Your Rank</p>
                <p className="text-xl font-bold text-amber-600">
                  #{rank.position} of {rank.totalUsers}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Your Points Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="earned"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.3}
                  name="Points Earned"
                />
                <Area
                  type="monotone"
                  dataKey="redeemed"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                  name="Points Redeemed"
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                  name="Net Points"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                    {transaction.orderNumber &&
                      ` • Order #${transaction.orderNumber}`}
                  </p>
                </div>
                <div
                  className={`font-bold ${
                    transaction.type === "EARNED"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "EARNED" ? "+" : "-"}
                  {transaction.points}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UserLoyaltySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[300px] rounded-xl" />
      <Skeleton className="h-[400px] rounded-xl" />
    </div>
  );
}
