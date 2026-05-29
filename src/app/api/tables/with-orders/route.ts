import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";

// GET /api/tables/with-orders - Get tables with active orders
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    // Check if user is staff
    if (
      !user ||
      (user.role !== "ADMIN" &&
        user.role !== "MANAGER" &&
        user.role !== "WAITER")
    ) {
      return NextResponse.json(
        { error: "Unauthorized. Staff access required." },
        { status: 401 },
      );
    }

    // Get all tables with active orders (DINE_IN orders that are not completed/cancelled)
    const activeOrders = await db.order.findMany({
      where: {
        orderType: "DINE_IN",
        status: {
          notIn: ["COMPLETED", "CANCELLED"],
        },
        tableNumber: {
          not: null,
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group orders by table number
    const tablesWithOrders = activeOrders.reduce(
      (acc, order) => {
        const tableNumber = order.tableNumber;
        if (!acc[tableNumber!]) {
          acc[tableNumber!] = {
            tableNumber: tableNumber!,
            orders: [],
            totalItems: 0,
            totalAmount: 0,
          };
        }
        acc[tableNumber!].orders.push(order);
        acc[tableNumber!].totalItems += order.items.length;
        acc[tableNumber!].totalAmount += order.finalAmount;
        return acc;
      },
      {} as Record<number, any>,
    );

    // Get table details
    const tables = await db.table.findMany({
      where: {
        tableNumber: {
          in: Object.keys(tablesWithOrders).map(Number),
        },
      },
    });

    const result = tables.map((table) => ({
      ...table,
      ...tablesWithOrders[table.tableNumber],
    }));

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
    });
  } catch (error) {
    console.log("Error fetching tables with orders:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch tables",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
