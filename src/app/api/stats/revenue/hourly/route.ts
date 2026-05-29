import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  const startDate = new Date(date + "T00:00:00.000Z");
  const endDate = new Date(date + "T23:59:59.999Z");

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

  // Initialize hourly data
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, "0")}:00`,
    revenue: 0,
    orders: 0,
  }));

  // Aggregate orders by hour
  orders.forEach((order) => {
    const hour = order.createdAt.getHours();
    hourlyData[hour].revenue += order.finalAmount;
    hourlyData[hour].orders += 1;
  });

  // Find peak hours (top 3)
  const peakHours = [...hourlyData]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);

  return NextResponse.json({
    data: hourlyData,
    peakHours,
  });
}
