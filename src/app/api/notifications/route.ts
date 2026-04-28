import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";
import { NotificationType } from "@/types/notification";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const skip = (page - 1) * limit;

    // Build where clause based on user role
    const whereClause: any = {};

    // Role-based notification filtering
    switch (user.role) {
      case "ADMIN":
        // Admins see all notifications
        whereClause.OR = [
          { userId: user.id },
          { userId: "admin" },
          { userId: "system" },
          { type: NotificationType.GENERAL_ANNOUNCEMENT },
          { type: NotificationType.ORDER_PLACED },
          { type: NotificationType.PAYMENT_FAILED },
        ];
        break;

      case "MANAGER":
        // Managers see all order and staff notifications
        whereClause.OR = [
          { userId: user.id },
          { userId: "manager" },
          { type: NotificationType.ORDER_PLACED },
          { type: NotificationType.ORDER_COMPLETED },
          { type: NotificationType.ORDER_CANCELLED },
          { type: NotificationType.PAYMENT_RECEIVED },
          { type: NotificationType.PAYMENT_FAILED },
          { type: NotificationType.RESERVATION_CONFIRMED },
          { type: NotificationType.RESERVATION_CANCELLED },
          { type: NotificationType.STAFF_ASSIGNMENT },
        ];
        break;

      case "CHEF":
        // Chefs see kitchen-related notifications
        whereClause.OR = [
          { userId: user.id },
          { userId: "kitchen" },
          { type: NotificationType.ORDER_CONFIRMED },
          { type: NotificationType.ORDER_PREPARING },
          { type: NotificationType.KITCHEN_ORDER },
          { type: NotificationType.ORDER_CANCELLED },
        ];
        break;

      case "BARTENDER":
        // Bartenders see bar-related notifications
        whereClause.OR = [
          { userId: user.id },
          { userId: "bar" },
          { type: NotificationType.BAR_ORDER },
          { type: NotificationType.ORDER_CONFIRMED },
          { type: NotificationType.ORDER_PREPARING },
        ];
        break;

      case "WAITER":
        // Waiters see dine-in order notifications
        whereClause.OR = [
          { userId: user.id },
          { userId: "waiters" },
          { type: NotificationType.ORDER_READY },
          { type: NotificationType.ORDER_SERVED },
          { type: NotificationType.TABLE_STATUS_UPDATE },
          { type: NotificationType.RESERVATION_CONFIRMED },
        ];
        break;

      default:
        // Regular customers see only their own notifications
        whereClause.userId = user.id;
    }

    // Add type filter if specified
    if (type) {
      whereClause.type = type;
    }

    // Add unread filter if specified
    if (unreadOnly) {
      whereClause.isRead = false;
    }

    // Fetch notifications
    const notifications = await db.notification.findMany({
      where: whereClause,
      include: {
        order: {
          select: {
            orderNumber: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count
    const totalCount = await db.notification.count({
      where: whereClause,
    });

    // Get unread count for the user
    const unreadCount = await db.notification.count({
      where: {
        ...whereClause,
        isRead: false,
      },
    });

    // Transform notifications for response
    const formattedNotifications = notifications.map((notification) => ({
      id: notification.id,
      userId: notification.userId,
      orderId: notification.orderId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      order: notification.order,
    }));

    return NextResponse.json({
      success: true,
      data: {
        notifications: formattedNotifications,
        unreadCount,
        totalCount,
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}
