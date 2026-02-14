// app/api/orders/orderItem/route.ts

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    console.log("Received PATCH request for Order Item ID:", id);

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "Order Item ID is required" },
        { status: 400 },
      );
    }

    const existingOrderItem = await db.orderItem.findUnique({
      where: { id },
    });

    if (!existingOrderItem) {
      return NextResponse.json(
        { success: false, message: "Order Item not found" },
        { status: 404 },
      );
    }

    if (existingOrderItem.isReady) {
      return NextResponse.json(
        { success: false, message: "Cannot set the same status" },
        { status: 400 },
      );
    }

    await db.orderItem.update({
      where: { id },
      data: { isReady: true, readyAt: new Date() },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order Item status updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
