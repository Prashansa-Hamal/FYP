// app/api/orders/payment/route.ts
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { PAYMENT_METHODS } from "@/types/enums";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, paymentMethod } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 },
      );
    }

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method",
          validMethods: PAYMENT_METHODS,
        },
        { status: 400 },
      );
    }

    // Check if order exists
    const existingOrder = await db.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    if (existingOrder.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, message: "Order is already Paid" },
        { status: 400 },
      );
    }

    // Define update data based on status
    const updateData: any = {
      paymentMethod,
      paymentStatus: "PAID",
      updatedAt: new Date(),
    };

    // Update the order
    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order paid successfully",
        order: updatedOrder,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating payment status:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
