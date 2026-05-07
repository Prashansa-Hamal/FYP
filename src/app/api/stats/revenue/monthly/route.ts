import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString(),
  );

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const orders = await db.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      paymentStatus: "PAID",
    },
    select: {
      createdAt: true,
      finalAmount: true,
    },
  });

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyData = months.map((month, index) => {
    const monthOrders = orders.filter(
      (order) => order.createdAt.getMonth() === index,
    );

    const revenue = monthOrders.reduce(
      (sum, order) => sum + order.finalAmount,
      0,
    );
    const count = monthOrders.length;

    return {
      month,
      revenue,
      orders: count,
      growth: 0, // Will calculate after
    };
  });

  // Calculate growth percentages
  for (let i = 1; i < monthlyData.length; i++) {
    const prevRevenue = monthlyData[i - 1].revenue;
    if (prevRevenue > 0) {
      monthlyData[i].growth =
        ((monthlyData[i].revenue - prevRevenue) / prevRevenue) * 100;
    }
  }

  const bestMonth = monthlyData.reduce((best, current) =>
    current.revenue > best.revenue ? current : best,
  );

  return NextResponse.json({
    data: monthlyData,
    summary: {
      totalYearRevenue: monthlyData.reduce(
        (sum, month) => sum + month.revenue,
        0,
      ),
      avgMonthlyRevenue:
        monthlyData.reduce((sum, month) => sum + month.revenue, 0) / 12,
      bestMonth,
    },
  });
}
