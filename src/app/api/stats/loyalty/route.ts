import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";
import { subMonths, format } from "date-fns";
import { UserLoyaltyStats } from "@/types/loyalty-stats";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's loyalty transactions
    const transactions = await db.loyaltyTransaction.findMany({
      where: { userId: user.id },
      include: {
        order: {
          select: { orderNumber: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get user's current points
    const currentUser = await db.user.findUnique({
      where: { id: user.id },
      select: { loyalityPoints: true },
    });

    const totalEarned = transactions
      .filter((t) => t.type === "EARNED")
      .reduce((sum, t) => sum + t.points, 0);

    const totalRedeemed = transactions
      .filter((t) => t.type === "REDEEMED")
      .reduce((sum, t) => sum + t.points, 0);

    const currentBalance = currentUser?.loyalityPoints || 0;

    // Determine tier
    let tier = "Bronze";
    let nextTierPoints = 1000;
    if (currentBalance >= 5000) {
      tier = "Platinum";
      nextTierPoints = 0;
    } else if (currentBalance >= 2000) {
      tier = "Gold";
      nextTierPoints = 5000 - currentBalance;
    } else if (currentBalance >= 1000) {
      tier = "Silver";
      nextTierPoints = 2000 - currentBalance;
    } else {
      nextTierPoints = 1000 - currentBalance;
    }

    const progressToNextTier =
      nextTierPoints > 0
        ? (currentBalance / (currentBalance + nextTierPoints)) * 100
        : 100;

    // Calculate monthly history (last 6 months)
    const monthlyHistory = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthTransactions = transactions.filter((t) => {
        const createdAt = new Date(t.createdAt);
        return createdAt >= monthStart && createdAt <= monthEnd;
      });

      const earned = monthTransactions
        .filter((t) => t.type === "EARNED")
        .reduce((sum, t) => sum + t.points, 0);

      const redeemed = monthTransactions
        .filter((t) => t.type === "REDEEMED")
        .reduce((sum, t) => sum + t.points, 0);

      monthlyHistory.push({
        month: format(date, "MMM yyyy"),
        earned,
        redeemed,
        net: earned - redeemed,
      });
    }

    // Calculate user rank
    const allUsers = await db.user.findMany({
      where: { loyalityPoints: { gt: 0 } },
      orderBy: { loyalityPoints: "desc" },
      select: { id: true, loyalityPoints: true },
    });

    const position = allUsers.findIndex((u) => u.id === user.id) + 1;
    const totalUsers = allUsers.length;
    const percentile = totalUsers > 0 ? (position / totalUsers) * 100 : 0;

    const stats: UserLoyaltyStats = {
      summary: {
        totalEarned,
        totalRedeemed,
        currentBalance,
        tier: tier as any,
        nextTierPoints,
        progressToNextTier: Math.round(progressToNextTier),
      },
      monthlyHistory,
      recentTransactions: transactions.slice(0, 10).map((t) => ({
        id: t.id,
        points: t.points,
        type: t.type,
        description: t.description || "",
        createdAt: t.createdAt.toISOString(),
        orderNumber: t.order?.orderNumber,
      })),
      rank: {
        position,
        totalUsers,
        percentile: Math.round(percentile),
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.log("Error fetching user loyalty stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user loyalty statistics" },
      { status: 500 },
    );
  }
}
