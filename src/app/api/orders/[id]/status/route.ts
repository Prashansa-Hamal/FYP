import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { OrderStatus } from "@/generated/prisma/enums";

export default async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  if (request.method !== "PATCH") {
    return NextResponse.json(
      { success: false, message: "Method not allowed" },
      { status: 405 }
    );
  }

  const { id } = await params;

  try {
    const { status, cancellationReason } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Validate order status
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid order status" },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await db.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Define update data based on status
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Set timestamps based on status transitions
    switch (status) {
      case "PREPARING":
        // You might want to set estimated ready time here
        updateData.estimatedReadyTime = new Date(Date.now() + 30 * 60000); // 30 minutes from now
        break;
      case "READY":
        updateData.readyAt = new Date();
        break;
      case "SERVED":
        updateData.servedAt = new Date();
        break;
      case "COMPLETED":
        updateData.completedAt = new Date();
        // Optionally auto-update payment status if not already paid
        if (existingOrder.paymentStatus === "PENDING") {
          updateData.paymentStatus = "PAID";
        }
        break;
      case "CANCELLED":
        updateData.cancelledAt = new Date();
        updateData.cancellationReason =
          cancellationReason || "No reason provided";

        // Optional: Automatically refund if already paid
        if (existingOrder.paymentStatus === "PAID") {
          updateData.paymentStatus = "REFUNDED";
        }
        break;
    }

    // Update the order
    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        deliveryAddress: true,
      },
    });

    // Optional: Send notifications based on status change
    // You can integrate with your notification service here
    // await sendOrderStatusNotification(updatedOrder);

    return NextResponse.json(
      { success: true, message: "Order status updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order status:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
