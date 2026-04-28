import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";

// GET user's loyalty points
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWithPoints = await db.user.findUnique({
      where: { id: user.id },
      select: {
        loyalityPoints: true,
        loyaltyTransactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            points: true,
            type: true,
            description: true,
            createdAt: true,
            order: {
              select: {
                orderNumber: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        points: userWithPoints?.loyalityPoints || 0,
        transactions: userWithPoints?.loyaltyTransactions || [],
      },
    });
  } catch (error) {
    console.error("Error fetching loyalty points:", error);
    return NextResponse.json(
      { error: "Failed to fetch loyalty points" },
      { status: 500 },
    );
  }
}
