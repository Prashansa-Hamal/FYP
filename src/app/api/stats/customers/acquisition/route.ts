import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "month"; // week, month, year

  const endDate = new Date();
  const startDate = new Date();

  if (period === "week") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === "month") {
    startDate.setMonth(startDate.getMonth() - 1);
  } else {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const customers = await db.user.findMany({
    where: {
      role: "USER",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      createdAt: true,
      orders: {
        select: { id: true },
        take: 1,
      },
    },
  });

  // Get returning customers (those with orders before this period)
  const returningCustomerIds = await db.order.findMany({
    where: {
      userId: { in: customers.map((c) => c.id) },
      createdAt: { lt: startDate },
    },
    select: { userId: true },
    distinct: ["userId"],
  });

  const returningSet = new Set(returningCustomerIds.map((c) => c.userId));

  // Group by date
  const dailyData = customers.reduce((acc: any, customer) => {
    const date = customer.createdAt.toISOString().split("T")[0];

    if (!acc[date]) {
      acc[date] = {
        date,
        newCustomers: 0,
        returningCustomers: 0,
        totalActive: 0,
      };
    }

    if (returningSet.has(customer.id)) {
      acc[date].returningCustomers += 1;
    } else {
      acc[date].newCustomers += 1;
    }

    return acc;
  }, {});

  // Calculate total active customers per day
  for (const date in dailyData) {
    dailyData[date].totalActive = await db.order
      .groupBy({
        by: ["userId"],
        where: {
          createdAt: {
            gte: new Date(date),
            lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
          },
        },
      })
      .then((res) => res.length);
  }

  const data = Object.values(dailyData).sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return NextResponse.json({ data });
}
