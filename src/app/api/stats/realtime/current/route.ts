import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    activeOrders,
    preparingOrders,
    readyOrders,
    todayStats,
    kitchenStats,
    barStats,
    tableStats,
  ] = await Promise.all([
    // Active orders (not completed/cancelled)
    db.order.count({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED", "PREPARING", "READY"],
        },
      },
    }),

    // Preparing orders
    db.order.count({
      where: { status: "PREPARING" },
    }),

    // Ready orders
    db.order.count({
      where: { status: "READY" },
    }),

    // Today's stats
    db.order
      .aggregate({
        where: {
          createdAt: { gte: today },
          status: "COMPLETED",
        },
        _count: true,
        _sum: { finalAmount: true },
      })
      .then((res) => ({
        ordersCompleted: res._count,
        revenue: res._sum.finalAmount || 0,
      })),

    // Kitchen stats
    db.orderStationAssignment
      .aggregate({
        where: {
          station: "KITCHEN",
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
        _count: true,
      })
      .then(async (res) => {
        const ready = await db.orderStationAssignment.count({
          where: {
            station: "KITCHEN",
            status: "COMPLETED",
            completedAt: { gte: today },
          },
        });

        return {
          itemsPreparing: res._count,
          itemsReady: ready,
        };
      }),

    // Bar stats
    db.orderStationAssignment
      .aggregate({
        where: {
          station: "BAR",
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
        _count: true,
      })
      .then(async (res) => {
        const ready = await db.orderStationAssignment.count({
          where: {
            station: "BAR",
            status: "COMPLETED",
            completedAt: { gte: today },
          },
        });

        return {
          itemsPreparing: res._count,
          itemsReady: ready,
        };
      }),

    // Table stats
    db.table
      .groupBy({
        by: ["isAvailable"],
        _count: true,
      })
      .then(async (res) => {
        const occupied = res.find((r) => !r.isAvailable)?._count || 0;
        const available = res.find((r) => r.isAvailable)?._count || 0;
        const reserved = await db.reservation.count({
          where: {
            reservationDate: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
            status: "CONFIRMED",
          },
        });

        return { occupied, available, reserved };
      }),
  ]);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    activeOrders,
    preparingOrders,
    readyOrders,
    todayStats,
    kitchen: kitchenStats,
    bar: barStats,
    tables: tableStats,
  });
}
