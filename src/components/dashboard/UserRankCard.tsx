"use client";

import { useLoyaltyLeaderboard } from "@/hooks/useLoyaltyLeaderboard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp, Award } from "lucide-react";

interface UserRankCardProps {
  userId: string;
  period?: "week" | "month" | "year" | "all";
}

export function UserRankCard({ userId, period = "all" }: UserRankCardProps) {
  const { data, isLoading } = useLoyaltyLeaderboard(period, 1, 100);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const userRank = data?.data.topUsers.find((u) => u.id === userId);
  const summary = data?.data.summary;

  if (!userRank) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-gray-500">
          No points earned this period
        </CardContent>
      </Card>
    );
  }

  const percentile = (
    (userRank.rank / (summary?.totalUsers || 1)) *
    100
  ).toFixed(1);

  return (
    <Card className="bg-gradient-to-r from-amber-50 to-orange-50">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Your Rank</p>
            <p className="text-2xl font-bold text-amber-600">
              #{userRank.rank}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Points Earned</p>
            <p className="text-2xl font-bold text-green-600">
              +{userRank.pointsEarned}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Percentile</p>
            <p className="text-2xl font-bold text-blue-600">
              Top {percentile}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Tier</p>
            <div className="flex items-center justify-center gap-1">
              {userRank.tier === "Platinum" && (
                <Trophy className="w-5 h-5 text-purple-500" />
              )}
              {userRank.tier === "Gold" && (
                <Award className="w-5 h-5 text-yellow-500" />
              )}
              {userRank.tier === "Silver" && (
                <Award className="w-5 h-5 text-gray-400" />
              )}
              {userRank.tier === "Bronze" && (
                <Award className="w-5 h-5 text-amber-500" />
              )}
              <span className="font-semibold">{userRank.tier}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
