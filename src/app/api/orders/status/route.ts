// app/api/orders/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { OrderStatus } from "@/generated/prisma/enums";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, cancellationReason } = body;

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
        {
          success: false,
          message: "Invalid order status",
          validStatuses: validStatuses,
        },
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

    if (existingOrder.status === status) {
      return NextResponse.json(
        { success: false, message: "Cannot set the same status" },
        { status: 400 }
      );
    }

    // Define update data based on status
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Set timestamps based on status transitions
    switch (status) {
      case OrderStatus.PENDING:
        updateData.estimatedReadyTime = new Date(Date.now() + 30 * 60000);
        break;
      case OrderStatus.READY:
        updateData.readyAt = new Date();
        break;
      case OrderStatus.SERVED:
        updateData.servedAt = new Date();
        break;
      case OrderStatus.COMPLETED:
        updateData.completedAt = new Date();
        // if (existingOrder.paymentStatus === "PENDING") {
        updateData.paymentStatus = "PAID";
        // }
        break;
      case OrderStatus.CANCELLED:
        updateData.cancelledAt = new Date();
        updateData.cancellationReason =
          cancellationReason || "No reason provided";

        if (existingOrder.paymentStatus === "PAID") {
          updateData.paymentStatus = "REFUNDED";
        }
        break;
    }

    // Update the order
    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order status updated successfully",
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order status:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
