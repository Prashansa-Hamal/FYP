import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  subWeeks,
  subMonths,
  subYears,
} from "date-fns";
import { LeaderboardUser } from "@/types/loyalty-stats";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    const { searchParams } = new URL(request.url);

    const period = searchParams.get("period") || "all"; // week, month, year, all
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Calculate date range based on period
    let startDate: Date | null = null;
    let dateRangeLabel = "";

    const now = new Date();

    switch (period) {
      case "week":
        startDate = startOfWeek(now);
        dateRangeLabel = "This Week";
        break;
      case "month":
        startDate = startOfMonth(now);
        dateRangeLabel = "This Month";
        break;
      case "year":
        startDate = startOfYear(now);
        dateRangeLabel = "This Year";
        break;
      case "all":
        startDate = null;
        dateRangeLabel = "All Time";
        break;
      default:
        startDate = null;
    }

    // Build where clause for transactions
    const transactionWhere: any = {
      type: "EARNED",
    };

    if (startDate) {
      transactionWhere.createdAt = {
        gte: startDate,
      };
    }

    // Get all users with their points earned in the period
    const userPoints = await db.loyaltyTransaction.groupBy({
      by: ["userId"],
      where: transactionWhere,
      _sum: {
        points: true,
      },
      orderBy: {
        _sum: {
          points: "desc",
        },
      },
    });

    // Get total points earned in period
    const totalPointsEarned = await db.loyaltyTransaction.aggregate({
      where: transactionWhere,
      _sum: {
        points: true,
      },
    });

    // Get all user details
    const userIds = userPoints.map((up) => up.userId);
    const users = await db.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        loyalityPoints: true,
        createdAt: true,
      },
    });

    // Get points redeemed for each user
    const redeemedWhere: any = {
      type: "REDEEMED",
    };
    if (startDate) {
      redeemedWhere.createdAt = {
        gte: startDate,
      };
    }

    const userRedeemed = await db.loyaltyTransaction.groupBy({
      by: ["userId"],
      where: redeemedWhere,
      _sum: {
        points: true,
      },
    });

    // Create a map for quick lookup
    const userMap = new Map(users.map((u) => [u.id, u]));
    const redeemedMap = new Map(
      userRedeemed.map((r) => [r.userId, r._sum.points || 0]),
    );

    // Build leaderboard data
    let leaderboardData: LeaderboardUser[] = userPoints.map((up, index) => {
      const userData = userMap.get(up.userId);
      const pointsRedeemed = redeemedMap.get(up.userId) || 0;
      const totalEarned = up._sum.points || 0;
      const currentBalance = userData?.loyalityPoints || 0;

      // Determine tier
      let tier: "Bronze" | "Silver" | "Gold" | "Platinum" = "Bronze";
      if (currentBalance >= 5000) tier = "Platinum";
      else if (currentBalance >= 2000) tier = "Gold";
      else if (currentBalance >= 1000) tier = "Silver";

      return {
        id: up.userId,
        name: userData?.name || "Unknown User",
        email: userData?.email || "",
        phone: userData?.phone || "",
        pointsEarned: totalEarned,
        pointsRedeemed: pointsRedeemed,
        currentBalance: currentBalance,
        rank: index + 1,
        tier,
        joinDate:
          userData?.createdAt?.toISOString() || new Date().toISOString(),
      };
    });

    // Get current user's rank
    let currentUserRank: any = null;
    if (user) {
      const userRankIndex = leaderboardData.findIndex((u) => u.id === user.id);
      if (userRankIndex !== -1) {
        currentUserRank = {
          rank: userRankIndex + 1,
          pointsEarned: leaderboardData[userRankIndex].pointsEarned,
          totalUsers: leaderboardData.length,
        };
      }
    }

    // Paginate
    const paginatedUsers = leaderboardData.slice(skip, skip + limit);
    const totalUsers = leaderboardData.length;
    const totalPages = Math.ceil(totalUsers / limit);

    // Calculate summary statistics
    const allPointsEarned = leaderboardData.reduce(
      (sum, u) => sum + u.pointsEarned,
      0,
    );
    const averagePoints =
      totalUsers > 0 ? Math.round(allPointsEarned / totalUsers) : 0;

    return NextResponse.json({
      success: true,
      data: {
        period: period as any,
        topUsers: paginatedUsers,
        currentUserRank,
        summary: {
          totalPointsEarned: allPointsEarned,
          totalUsers: totalUsers,
          averagePoints: averagePoints,
          dateRange: dateRangeLabel,
        },
      },
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}
