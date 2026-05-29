import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate =
    searchParams.get("startDate") ||
    new Date(new Date().setDate(1)).toISOString().split("T")[0];
  const endDate =
    searchParams.get("endDate") || new Date().toISOString().split("T")[0];

  const orders = await db.order.findMany({
    where: {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate + "T23:59:59.999Z"),
      },
      paymentStatus: "PAID",
    },
    select: {
      createdAt: true,
      finalAmount: true,
      id: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group by date
  const dailyData = orders.reduce((acc: any, order) => {
    const date = order.createdAt.toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        revenue: 0,
        orders: 0,
        totalAmount: 0,
      };
    }
    acc[date].revenue += order.finalAmount;
    acc[date].orders += 1;
    acc[date].totalAmount += order.finalAmount;
    return acc;
  }, {});

  const data = Object.values(dailyData).map((day: any) => ({
    ...day,
    averageOrderValue: day.revenue / day.orders,
  }));

  // Calculate summary
  const summary = {
    totalRevenue: data.reduce((sum: number, day: any) => sum + day.revenue, 0),
    totalOrders: data.reduce((sum: number, day: any) => sum + day.orders, 0),
    avgDailyRevenue: data.length
      ? data.reduce((sum: number, day: any) => sum + day.revenue, 0) /
        data.length
      : 0,
    bestDay: data.length
      ? data.reduce(
          (best: any, day: any) =>
            day.revenue > (best?.revenue || 0) ? day : best,
          null,
        )
      : null,
  };

  return NextResponse.json({ data, summary });
}
