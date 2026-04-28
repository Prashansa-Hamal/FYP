import { NotificationType } from "@/generated/enums";
import db from "@/lib/db";
import { subDays } from "date-fns";

export async function createNotifications() {
  console.log("Creating notifications...");

  const users = await db.user.findMany();
  const orders = await db.order.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  const notificationTypes = [
    NotificationType.ORDER_READY,
    NotificationType.ORDER_PREPARING,
    NotificationType.ORDER_SERVED,
    NotificationType.ORDER_CANCELLED,
    NotificationType.GENERAL,
  ];

  // Create notifications for users
  for (const user of users) {
    const numNotifications = Math.floor(Math.random() * 10) + 5;

    for (let i = 0; i < numNotifications; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const notificationDate = subDays(new Date(), daysAgo);

      const type =
        notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const order =
        Math.random() > 0.5 && orders.length > 0
          ? orders[Math.floor(Math.random() * orders.length)]
          : null;

      let title, message;
      switch (type) {
        case NotificationType.ORDER_READY:
          title = "Order Ready for Pickup";
          message = `Your order #${order?.orderNumber || "ORD-1234"} is ready for pickup.`;
          break;
        case NotificationType.ORDER_PREPARING:
          title = "Order is Being Prepared";
          message = `Your order #${order?.orderNumber || "ORD-1234"} is now being prepared.`;
          break;
        case NotificationType.ORDER_SERVED:
          title = "Order Served";
          message = `Your order #${order?.orderNumber || "ORD-1234"} has been served. Enjoy your meal!`;
          break;
        case NotificationType.ORDER_CANCELLED:
          title = "Order Cancelled";
          message = `Your order #${order?.orderNumber || "ORD-1234"} has been cancelled.`;
          break;
        default:
          title = "Special Offer";
          message = "Check out our new seasonal menu items!";
      }

      await db.notification.create({
        data: {
          userId: user.id,
          orderId: order?.id,
          type,
          title,
          message,
          isRead: Math.random() > 0.3, // 70% read
          createdAt: notificationDate,
        },
      });
    }
  }

  console.log("Created notifications");
}
