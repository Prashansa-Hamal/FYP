import { NextResponse } from "next/server";
import { verifyEsewaPayment } from "@/lib/esewa";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { encodedData } = body;

    if (!encodedData) {
      return NextResponse.json(
        { success: false, message: "Missing encoded data" },
        { status: 400 },
      );
    }

    const verificationResult = await verifyEsewaPayment(encodedData);

    if (!verificationResult.success || !verificationResult.decodedData) {
      return NextResponse.json(
        {
          success: false,
          message: verificationResult.message || "Payment verification failed",
        },
        { status: 400 },
      );
    }

    const { transaction_uuid, transaction_code, total_amount } =
      verificationResult.decodedData;

    // transaction_uuid is the orderId passed during eSewa initiation
    const order = await db.order.findUnique({
      where: { id: transaction_uuid },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found for this transaction" },
        { status: 404 },
      );
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Payment already recorded",
        data: verificationResult,
      });
    }

    // Update payment and order inside a transaction
    await db.$transaction(async (tx) => {
      // Find the pending eSewa payment for this order
      const existingPayment = await tx.payment.findFirst({
        where: { orderId: order.id, paymentMethod: "ESEWA", status: "PENDING" },
      });

      if (existingPayment) {
        await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: "PAID",
            transactionId: transaction_code,
            paidAt: new Date(),
            gatewayResponse: verificationResult.response as object,
          },
        });
      } else {
        // Payment record may not exist yet — create it
        await tx.payment.create({
          data: {
            orderId: order.id,
            amount: Number(total_amount),
            paymentMethod: "ESEWA",
            status: "PAID",
            transactionId: transaction_code,
            paidAt: new Date(),
            gatewayResponse: verificationResult.response as object,
          },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
        },
      });

      if (order.userId && order.userId !== "guest") {
        await tx.notification.create({
          data: {
            userId: order.userId,
            orderId: order.id,
            type: "PAYMENT_RECEIVED",
            title: "Payment Successful",
            message: `Your eSewa payment of NPR ${total_amount} was received. Order #${order.orderNumber} is confirmed.`,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and order confirmed",
      data: verificationResult,
    });
  } catch (error) {
    console.error("eSewa verify error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
