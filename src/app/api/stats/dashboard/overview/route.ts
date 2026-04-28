import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const [
    todayOrders,
    weekOrders,
    monthOrders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    completedOrders,
    cancelledOrders,
    lowStockItems,
    activeStaff,
    totalCustomers,
    newCustomersToday,
  ] = await Promise.all([
    // Today's revenue
    db.order.aggregate({
      where: {
        createdAt: { gte: today },
        paymentStatus: "PAID",
      },
      _sum: { finalAmount: true },
      _count: true,
    }),
    // Week's revenue
    db.order.aggregate({
      where: {
        createdAt: { gte: weekAgo },
        paymentStatus: "PAID",
      },
      _sum: { finalAmount: true },
    }),
    // Month's revenue
    db.order.aggregate({
      where: {
        createdAt: { gte: monthAgo },
        paymentStatus: "PAID",
      },
      _sum: { finalAmount: true },
    }),
    // Pending orders count
    db.order.count({ where: { status: "PENDING" } }),
    // Preparing orders count
    db.order.count({ where: { status: "PREPARING" } }),
    // Ready orders count
    db.order.count({ where: { status: "READY" } }),
    // Completed orders count
    db.order.count({ where: { status: "COMPLETED" } }),
    // Cancelled orders count
    db.order.count({ where: { status: "CANCELLED" } }),
    // Low stock items
    db.inventory.count({
      where: {
        quantity: { lte: db.inventory.fields.minThreshold },
      },
    }),
    // Active staff (on shift today)
    db.staffShift.count({
      where: {
        shiftDate: { gte: today },
        checkedOutAt: null,
      },
    }),
    // Total customers
    db.user.count({ where: { role: "USER" } }),
    // New customers today
    db.user.count({
      where: {
        role: "USER",
        createdAt: { gte: today },
      },
    }),
  ]);

  const lastWeekOrders = await db.order.aggregate({
    where: {
      createdAt: {
        gte: new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
        lt: weekAgo,
      },
      paymentStatus: "PAID",
    },
    _sum: { finalAmount: true },
  });

  const revenueTrend = lastWeekOrders._sum.finalAmount
    ? (((weekOrders._sum.finalAmount || 0) - lastWeekOrders._sum.finalAmount) /
        lastWeekOrders._sum.finalAmount) *
      100
    : 0;

  return NextResponse.json({
    revenue: {
      today: todayOrders._sum.finalAmount || 0,
      week: weekOrders._sum.finalAmount || 0,
      month: monthOrders._sum.finalAmount || 0,
      trend: revenueTrend,
    },
    orders: {
      total: todayOrders._count,
      pending: pendingOrders,
      preparing: preparingOrders,
      ready: readyOrders,
      completed: completedOrders,
      cancelled: cancelledOrders,
    },
    customers: {
      total: totalCustomers,
      newToday: newCustomersToday,
      active: await db.order
        .groupBy({
          by: ["userId"],
          where: { createdAt: { gte: today } },
          _count: true,
        })
        .then((res) => res.length),
    },
    inventory: {
      lowStock: lowStockItems,
      outOfStock: await db.inventory.count({ where: { quantity: 0 } }),
      totalItems: await db.inventory.count(),
    },
    staff: {
      active: activeStaff,
      onShift: await db.staffShift.count({
        where: {
          shiftDate: { gte: today },
          startTime: { lte: new Date() },
          endTime: { gte: new Date() },
        },
      }),
      total: await db.user.count({
        where: { role: { in: ["CHEF", "BARTENDER", "WAITER", "MANAGER"] } },
      }),
    },
  });
}
