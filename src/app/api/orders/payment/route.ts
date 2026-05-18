import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { PAYMENT_METHODS } from "@/types/enums";
import { getUser } from "@/data/user";

export async function PATCH(request: NextRequest) {
  try {
    // SECURITY: Check authentication
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    // SECURITY: Only CASHIER, MANAGER, and ADMIN can mark orders as paid
    const authorizedRoles = ["CASHIER", "MANAGER", "ADMIN"];
    if (!authorizedRoles.includes(user.role)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized. Only cashiers and managers can process payments." 
        },
        { status: 403 },
      );
    }

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

    // Create audit log
    console.log(`[PAYMENT AUDIT] Order ${id} marked as paid by ${user.role} user ${user.id} using ${paymentMethod}`);

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
