import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const orders = await db.order.groupBy({
    by: ["orderType"],
    _count: true,
    _sum: {
      finalAmount: true,
    },
  });

  const totalOrders = orders.reduce((sum, item) => sum + item._count, 0);

  const data = orders.map((item) => ({
    type: item.orderType,
    count: item._count,
    percentage: (item._count / totalOrders) * 100,
    revenue: item._sum.finalAmount || 0,
  }));

  const sorted = [...data].sort((a, b) => b.count - a.count);

  return NextResponse.json({
    data,
    summary: {
      mostPopular: sorted[0]?.type,
      leastPopular: sorted[sorted.length - 1]?.type,
    },
  });
}
