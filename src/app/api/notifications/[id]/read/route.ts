import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notificationId = params.id;

    // Check if notification exists and belongs to user
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    // Check if user has permission to mark this notification as read
    const hasPermission =
      notification.userId === user.id ||
      notification.userId === "system" ||
      notification.userId === "kitchen" ||
      notification.userId === "waiters" ||
      notification.userId === "admin" ||
      user.role === "ADMIN";

    if (!hasPermission) {
      return NextResponse.json(
        {
          error: "You don't have permission to mark this notification as read",
        },
        { status: 403 },
      );
    }

    // Mark as read
    const updated = await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
      data: updated,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 },
    );
  }
}
