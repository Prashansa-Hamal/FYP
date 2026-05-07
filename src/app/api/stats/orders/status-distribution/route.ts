import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const orders = await db.order.groupBy({
    by: ["status"],
    _count: true,
    _sum: {
      finalAmount: true,
    },
  });

  const totalOrders = orders.reduce((sum, item) => sum + item._count, 0);
  const totalRevenue = orders.reduce(
    (sum, item) => sum + (item._sum.finalAmount || 0),
    0,
  );

  const data = orders.map((item) => ({
    status: item.status,
    count: item._count,
    percentage: (item._count / totalOrders) * 100,
    value: item._sum.finalAmount || 0,
  }));

  return NextResponse.json({ data });
}
