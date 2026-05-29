import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "week"; // week or month

  const endDate = new Date();
  const startDate = new Date();

  if (period === "week") {
    startDate.setDate(startDate.getDate() - 7);
  } else {
    startDate.setMonth(startDate.getMonth() - 1);
  }

  const orders = await db.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
      orderType: true,
    },
  });

  // Group by date and type
  const timelineData = orders.reduce((acc: any, order) => {
    const date = order.createdAt.toISOString().split("T")[0];

    if (!acc[date]) {
      acc[date] = {
        date,
        dineIn: 0,
        takeaway: 0,
        delivery: 0,
        total: 0,
      };
    }

    acc[date][order.orderType.toLowerCase()] += 1;
    acc[date].total += 1;

    return acc;
  }, {});

  const data = Object.values(timelineData).sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return NextResponse.json({ data });
}
