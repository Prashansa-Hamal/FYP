import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  UserRole,
} from "@/generated/client";
import db from "@/lib/db";
import { addDays, addMinutes, subDays, setHours, setMinutes } from "date-fns";

export async function createOrders() {
  console.log("Creating orders...");

  const users = await db.user.findMany({
    where: { role: UserRole.USER },
  });

  const menuItems = await db.menuItem.findMany();
  const addresses = await db.address.findMany();
  const tables = await db.table.findMany();

  // Generate orders for the last 7 days (reduced for faster seeding)
  const startDate = subDays(new Date(), 7);
  const endDate = new Date();

  let orderNumber = 1000;
  const orders = [];

  for (let day = 0; day <= 7; day++) {
    const currentDate = addDays(startDate, day);

    // Determine number of orders for this day (weekends have more orders)
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const baseOrders = isWeekend ? 15 : 10; // Reduced from 30/20

    // Add some randomness
    const numOrders = Math.floor(baseOrders + (Math.random() * 5 - 2)); // Reduced randomness

    for (let i = 0; i < numOrders; i++) {
      // Random order time throughout the day (peak hours: 12-2pm, 6-9pm)
      let hour;
      if (Math.random() > 0.6) {
        // Peak hours
        hour =
          Math.random() > 0.5
            ? 12 + Math.floor(Math.random() * 2) // Lunch: 12-2pm
            : 18 + Math.floor(Math.random() * 3); // Dinner: 6-9pm
      } else {
        // Off-peak
        hour = Math.floor(Math.random() * 24);
      }

      const minute = Math.floor(Math.random() * 60);
      const orderDate = setMinutes(setHours(currentDate, hour), minute);

      // Determine order type
      const orderTypeRoll = Math.random();
      let orderType: OrderType;
      let tableNumber = null;
      let deliveryAddressId = null;

      if (orderTypeRoll < 0.5) {
        orderType = OrderType.DINE_IN;
        tableNumber =
          tables[Math.floor(Math.random() * tables.length)].tableNumber;
      } else if (orderTypeRoll < 0.75) {
        orderType = OrderType.TAKEAWAY;
      } else {
        orderType = OrderType.DELIVERY;
        deliveryAddressId =
          addresses.length > 0
            ? addresses[Math.floor(Math.random() * addresses.length)].id
            : null;
      }

      // Random user (80% registered, 20% guest - represented by random user)
      const user = users[Math.floor(Math.random() * users.length)];

      // Generate order items
      const numItems = Math.floor(Math.random() * 4) + 1;
      const orderItems = [];
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const menuItem =
          menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = menuItem.price;
        const totalPrice = unitPrice * quantity;
        totalAmount += totalPrice;

        orderItems.push({
          menuItemId: menuItem.id,
          quantity,
          unitPrice,
          totalPrice,
          specialInstructions:
            Math.random() > 0.8 ? "Extra sauce please" : null,
        });
      }

      // Calculate taxes and discounts
      const taxAmount = totalAmount * 0.08; // 8% tax
      const discountAmount = Math.random() > 0.9 ? totalAmount * 0.1 : 0; // 10% discount occasionally
      const finalAmount = totalAmount + taxAmount - discountAmount;

      // Determine order status based on order date
      let status: OrderStatus;
      let paymentStatus: PaymentStatus;
      const now = new Date();

      if (orderDate > now) {
        // Future orders (shouldn't happen, but just in case)
        status = OrderStatus.PENDING;
        paymentStatus = PaymentStatus.PENDING;
      } else {
        const hoursSinceOrder =
          (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceOrder < 1) {
          // Recent orders
          const statusRoll = Math.random();
          if (statusRoll < 0.3) status = OrderStatus.PENDING;
          else if (statusRoll < 0.6) status = OrderStatus.CONFIRMED;
          else if (statusRoll < 0.8) status = OrderStatus.PREPARING;
          else status = OrderStatus.READY;

          paymentStatus =
            Math.random() > 0.2 ? PaymentStatus.PAID : PaymentStatus.PENDING;
        } else if (hoursSinceOrder < 3) {
          // Orders from a few hours ago
          const statusRoll = Math.random();
          if (statusRoll < 0.2) status = OrderStatus.PREPARING;
          else if (statusRoll < 0.5) status = OrderStatus.READY;
          else if (statusRoll < 0.8) status = OrderStatus.SERVED;
          else status = OrderStatus.COMPLETED;

          paymentStatus =
            Math.random() > 0.1 ? PaymentStatus.PAID : PaymentStatus.PENDING;
        } else {
          // Older orders - mostly completed
          const statusRoll = Math.random();
          if (statusRoll < 0.7) status = OrderStatus.COMPLETED;
          else if (statusRoll < 0.85) status = OrderStatus.CANCELLED;
          else status = OrderStatus.SERVED;

          paymentStatus =
            status === OrderStatus.CANCELLED
              ? PaymentStatus.REFUNDED
              : Math.random() > 0.05
                ? PaymentStatus.PAID
                : PaymentStatus.FAILED;
        }
      }

      // Calculate timestamps based on status
      let estimatedReadyTime = null;
      let readyAt = null;
      let servedAt = null;
      let completedAt = null;
      let cancelledAt = null;

      if (status !== OrderStatus.PENDING && status !== OrderStatus.CANCELLED) {
        estimatedReadyTime = addMinutes(orderDate, 25); // Estimated 25 min prep time
      }

      if (
        status === OrderStatus.READY ||
        status === OrderStatus.SERVED ||
        status === OrderStatus.COMPLETED
      ) {
        readyAt = addMinutes(orderDate, 20 + Math.floor(Math.random() * 10));
      }

      if (status === OrderStatus.SERVED || status === OrderStatus.COMPLETED) {
        servedAt = addMinutes(
          readyAt || orderDate,
          5 + Math.floor(Math.random() * 10),
        );
      }

      if (status === OrderStatus.COMPLETED) {
        completedAt = addMinutes(
          servedAt || orderDate,
          30 + Math.floor(Math.random() * 30),
        );
      }

      if (status === OrderStatus.CANCELLED) {
        cancelledAt = addMinutes(
          orderDate,
          10 + Math.floor(Math.random() * 20),
        );
      }

      // Create the order
      try {
        const order = await db.order.create({
          data: {
            orderNumber: `ORD-${orderNumber++}`,
            userId: user.id,
            tableNumber,
            orderType,
            status,
            paymentStatus,
            paymentMethod: [
              PaymentMethod.COD,
              PaymentMethod.ESEWA,
              PaymentMethod.KHALTI,
            ][Math.floor(Math.random() * 3)],
            totalAmount,
            taxAmount,
            discountAmount,
            finalAmount,
            deliveryAddressId,
            specialInstructions:
              Math.random() > 0.9 ? "Please deliver to back door" : null,
            estimatedReadyTime,
            readyAt,
            servedAt,
            completedAt,
            cancelledAt,
            createdAt: orderDate,
            items: {
              create: orderItems.map((item) => ({
                ...item,
                isReady:
                  status === OrderStatus.READY ||
                  status === OrderStatus.SERVED ||
                  status === OrderStatus.COMPLETED,
                readyAt:
                  status === OrderStatus.READY ||
                  status === OrderStatus.SERVED ||
                  status === OrderStatus.COMPLETED
                    ? addMinutes(orderDate, 20 + Math.floor(Math.random() * 10))
                    : null,
              })),
            },
          },
        });

        orders.push(order);

        // Create station assignments for each item
        const orderItemsFromDb = await db.orderItem.findMany({
          where: { orderId: order.id },
          include: { menuItem: true },
        });

        for (const orderItem of orderItemsFromDb) {
          await db.orderStationAssignment.create({
            data: {
              orderItemId: orderItem.id,
              station: orderItem.menuItem.preparationStation,
              assignedTo: null, // Will be assigned in staff shifts
              status: orderItem.isReady ? "COMPLETED" : "PENDING",
              estimatedCompletionTime: addMinutes(
                orderDate,
                orderItem.menuItem.preparationTime,
              ),
              startedAt: orderItem.isReady ? addMinutes(orderDate, 5) : null,
              completedAt: orderItem.readyAt,
            },
          });
        }

        // Create payment record
        if (order.paymentMethod) {
          await db.payment.create({
            data: {
              orderId: order.id,
              amount: finalAmount,
              paymentMethod: order.paymentMethod,
              status: order.paymentStatus,
              transactionId: `TXN-${Math.random().toString(36).substring(7).toUpperCase()}`,
              paymentGateway: ["Stripe", "PayPal", "ESEWA"][
                Math.floor(Math.random() * 3)
              ],
              paidAt:
                order.paymentStatus === PaymentStatus.PAID
                  ? addMinutes(orderDate, 5)
                  : null,
            },
          });
        }
      } catch (error) {
        console.error(`Error creating order ${orderNumber - 1}:`, error);
        // Continue with next order
      }
    }
  }

  console.log(`Created ${orders.length} orders`);
  return orders;
}
