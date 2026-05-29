import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build where clause based on user role (same as GET)
    let whereClause: any = { isRead: false };

    switch (user.role) {
      case "ADMIN":
        whereClause.OR = [
          { userId: user.id },
          { userId: "admin" },
          { userId: "system" },
          { type: "GENERAL_ANNOUNCEMENT" },
          { type: "ORDER_PLACED" },
          { type: "PAYMENT_FAILED" },
        ];
        break;

      case "MANAGER":
        whereClause.OR = [
          { userId: user.id },
          { userId: "manager" },
          { type: "ORDER_PLACED" },
          { type: "ORDER_COMPLETED" },
          { type: "ORDER_CANCELLED" },
          { type: "PAYMENT_RECEIVED" },
          { type: "PAYMENT_FAILED" },
          { type: "RESERVATION_CONFIRMED" },
          { type: "RESERVATION_CANCELLED" },
          { type: "STAFF_ASSIGNMENT" },
        ];
        break;

      case "CHEF":
        whereClause.OR = [
          { userId: user.id },
          { userId: "kitchen" },
          { type: "ORDER_CONFIRMED" },
          { type: "ORDER_PREPARING" },
          { type: "KITCHEN_ORDER" },
          { type: "ORDER_CANCELLED" },
        ];
        break;

      case "BARTENDER":
        whereClause.OR = [
          { userId: user.id },
          { userId: "bar" },
          { type: "BAR_ORDER" },
          { type: "ORDER_CONFIRMED" },
          { type: "ORDER_PREPARING" },
        ];
        break;

      case "WAITER":
        whereClause.OR = [
          { userId: user.id },
          { userId: "waiters" },
          { type: "ORDER_READY" },
          { type: "ORDER_SERVED" },
          { type: "TABLE_STATUS_UPDATE" },
          { type: "RESERVATION_CONFIRMED" },
        ];
        break;

      default:
        whereClause.userId = user.id;
    }

    // Mark all as read
    const result = await db.notification.updateMany({
      where: whereClause,
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
      count: result.count,
    });
  } catch (error) {
    console.log("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 },
    );
  }
}
