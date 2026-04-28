import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10");
  const period = searchParams.get("period") || "month";

  const endDate = new Date();
  const startDate = new Date();

  if (period === "week") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === "month") {
    startDate.setMonth(startDate.getMonth() - 1);
  } else {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const orderItems = await db.orderItem.groupBy({
    by: ["menuItemId"],
    where: {
      order: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    _sum: {
      quantity: true,
      totalPrice: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: limit,
  });

  const menuItems = await db.menuItem.findMany({
    where: {
      id: {
        in: orderItems.map((item) => item.menuItemId),
      },
    },
    select: {
      id: true,
      name: true,
      category: true,
    },
  });

  const totalQuantity = orderItems.reduce(
    (sum, item) => sum + (item._sum.quantity || 0),
    0,
  );

  // Get previous period data for trend calculation
  const prevStartDate = new Date(startDate);
  const prevEndDate = new Date(startDate);
  prevStartDate.setMonth(prevStartDate.getMonth() - 1);

  const prevPeriodItems = await db.orderItem.groupBy({
    by: ["menuItemId"],
    where: {
      order: {
        createdAt: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
    },
    _sum: {
      quantity: true,
    },
  });

  const data = orderItems.map((item) => {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId);
    const prevItem = prevPeriodItems.find(
      (p) => p.menuItemId === item.menuItemId,
    );
    const prevQuantity = prevItem?._sum.quantity || 0;
    const currentQuantity = item._sum.quantity || 0;

    const trend =
      prevQuantity > 0
        ? ((currentQuantity - prevQuantity) / prevQuantity) * 100
        : 100;

    return {
      id: item.menuItemId,
      name: menuItem?.name || "Unknown",
      category: menuItem?.category || "OTHER",
      quantity: currentQuantity,
      revenue: item._sum.totalPrice || 0,
      percentageOfSales: (currentQuantity / totalQuantity) * 100,
      trend,
    };
  });

  return NextResponse.json({ data });
}
