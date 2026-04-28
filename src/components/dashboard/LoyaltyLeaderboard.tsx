"use client";

import { useState } from "react";
import { useLoyaltyLeaderboard } from "@/hooks/useLoyaltyLeaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const rankColors = {
  1: "bg-gradient-to-r from-yellow-500 to-amber-500",
  2: "bg-gradient-to-r from-gray-400 to-gray-500",
  3: "bg-gradient-to-r from-amber-600 to-amber-700",
};

const rankIcons = {
  1: <Crown className="w-5 h-5 text-yellow-500" />,
  2: <Medal className="w-5 h-5 text-gray-400" />,
  3: <Medal className="w-5 h-5 text-amber-600" />,
};

export function LoyaltyLeaderboard() {
  const [period, setPeriod] = useState<"week" | "month" | "year" | "all">(
    "all",
  );
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useLoyaltyLeaderboard(period, page, 20);

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  if (error || !data?.success) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-500">
          Failed to load leaderboard
        </CardContent>
      </Card>
    );
  }

  const { topUsers, summary } = data.data;
  const { pagination } = data;

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg">
          1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold">
          2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 flex items-center justify-center text-white font-bold">
          3
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
        {rank}
      </div>
    );
  };

  const getPeriodLabel = () => {
    switch (period) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "year":
        return "This Year";
      default:
        return "All Time";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Loyalty Leaderboard
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Top users by points earned - {getPeriodLabel()}
          </p>
        </div>

        <Tabs
          value={period}
          onValueChange={(v) => {
            setPeriod(v as any);
            setPage(1);
          }}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Points Earned</p>
                <p className="text-2xl font-bold text-amber-600">
                  {summary.totalPointsEarned.toLocaleString()}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.totalUsers.toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Points</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.averagePoints.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-600">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-5">User</div>
              <div className="col-span-2 text-right">Earned</div>
              <div className="col-span-2 text-right">Redeemed</div>
              <div className="col-span-2 text-right">Balance</div>
            </div>

            {/* Users List */}
            {topUsers.map((user) => (
              <div
                key={user.id}
                className={cn(
                  "grid grid-cols-12 gap-4 px-4 py-3 rounded-lg transition-all duration-200",
                  user.rank <= 3
                    ? "bg-gradient-to-r from-amber-50/50 to-transparent"
                    : "hover:bg-gray-50",
                )}
              >
                <div className="col-span-1 flex justify-center">
                  {getRankBadge(user.rank)}
                </div>

                <div className="col-span-5 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className={cn(
                        "text-white",
                        user.rank === 1
                          ? "bg-amber-500"
                          : user.rank === 2
                            ? "bg-gray-500"
                            : user.rank === 3
                              ? "bg-amber-600"
                              : "bg-gray-400",
                      )}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="col-span-2 text-right">
                  <p className="font-semibold text-green-600">
                    +{user.pointsEarned.toLocaleString()}
                  </p>
                </div>

                <div className="col-span-2 text-right">
                  <p className="font-semibold text-red-600">
                    -{user.pointsRedeemed.toLocaleString()}
                  </p>
                </div>

                <div className="col-span-2 text-right">
                  <p className="font-bold text-amber-600">
                    {user.currentBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
