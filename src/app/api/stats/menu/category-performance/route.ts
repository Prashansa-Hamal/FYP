import db from "@/lib/db";
import { NextResponse } from "next/server";
import { ItemCategory } from "@/generated/enums";

export async function GET() {
  const categories = Object.values(ItemCategory);

  const categoryData = await Promise.all(
    categories.map(async (category) => {
      const items = await db.menuItem.findMany({
        where: { category },
        select: { id: true },
      });

      const orderItems = await db.orderItem.findMany({
        where: {
          menuItemId: {
            in: items.map((i) => i.id),
          },
        },
        include: {
          order: true,
        },
      });

      const itemsSold = orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const revenue = orderItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );

      return {
        category,
        itemsSold,
        revenue,
        averageOrderValue:
          orderItems.length > 0 ? revenue / orderItems.length : 0,
      };
    }),
  );

  const totalRevenue = categoryData.reduce((sum, cat) => sum + cat.revenue, 0);

  const data = categoryData.map((cat) => ({
    ...cat,
    percentageOfSales:
      totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0,
  }));

  return NextResponse.json({ data });
}
