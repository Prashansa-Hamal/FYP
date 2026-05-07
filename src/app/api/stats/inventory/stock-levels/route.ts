import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const inventory = await db.inventory.findMany({
    orderBy: {
      category: "asc",
    },
  });

  // Calculate usage rate from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const usageData = await db.orderItem.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
    },
    include: {
      menuItem: true,
    },
  });

  // Group by categories and items
  const data = inventory.reduce((acc: any, item) => {
    const category = item.category;

    if (!acc[category]) {
      acc[category] = {
        category,
        items: [],
      };
    }

    // Calculate usage rate for this item (simplified - you'd need actual recipe mappings)
    const usageRate = 2.5; // This should be calculated based on actual usage
    const daysRemaining = usageRate > 0 ? item.quantity / usageRate : 999;

    let status: "good" | "low" | "critical" = "good";
    if (item.quantity <= item.minThreshold) {
      status = "critical";
    } else if (item.quantity <= item.minThreshold * 1.5) {
      status = "low";
    }

    acc[category].items.push({
      name: item.itemName,
      currentStock: item.quantity,
      minThreshold: item.minThreshold,
      status,
      usageRate,
      daysRemaining,
    });

    return acc;
  }, {});

  return NextResponse.json({ data: Object.values(data) });
}
