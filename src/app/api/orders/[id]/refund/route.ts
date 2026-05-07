import db from "@/lib/db";
import { getUser } from "@/data/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return NextResponse.json(
        { success: false, message: "Only admins and managers can process refunds" },
        { status: 403 },
      );
    }

    const { id: orderId } = await params;

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    if (order.status !== "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          message: "Refunds can only be issued for cancelled orders. Cancel the order first.",
        },
        { status: 400 },
      );
    }

    if (order.paymentStatus !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          message: `Order payment status is ${order.paymentStatus}. Only paid orders can be refunded.`,
        },
        { status: 400 },
      );
    }

    const paidPayment = order.payments.find((p) => p.status === "PAID");

    if (!paidPayment) {
      return NextResponse.json(
        { success: false, message: "No completed payment record found for this order" },
        { status: 400 },
      );
    }

    // Process refund inside a transaction
    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paidPayment.id },
        data: {
          status: "REFUNDED",
          refundedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: "REFUNDED" },
      });

      // Notify the customer if this wasn't a guest order
      if (order.userId && order.userId !== "guest") {
        await tx.notification.create({
          data: {
            userId: order.userId,
            orderId: order.id,
            type: "PAYMENT_RECEIVED",
            title: "Refund Processed",
            message: `A refund of NPR ${order.finalAmount.toFixed(2)} has been issued for cancelled order #${order.orderNumber}.`,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Refund of NPR ${order.finalAmount.toFixed(2)} processed for order #${order.orderNumber}`,
      refund: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.finalAmount,
        paymentMethod: paidPayment.paymentMethod,
        refundedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
