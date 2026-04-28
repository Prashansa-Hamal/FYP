import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    // 1. Log request start
    console.log("=== ORDER STATUS UPDATE START ===");

    // 2. Parse and validate body
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    const { id, status, cancellationReason } = body;

    if (!id || typeof id !== "string") {
      console.error("Missing or invalid order ID:", id);
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 },
      );
    }

    // 3. Valid statuses
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "SERVED",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      console.error("Invalid status:", status);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status",
          validStatuses,
        },
        { status: 400 },
      );
    }

    console.log(`Updating order ${id} to status: ${status}`);

    // 4. Check if order exists
    let existingOrder;
    try {
      existingOrder = await db.order.findUnique({
        where: { id },
        include: {
          user: true,
        },
      });
      console.log(
        "Found order:",
        existingOrder ? `Order #${existingOrder.orderNumber}` : "Not found",
      );
    } catch (error) {
      console.error("Database error when fetching order:", error);
      throw new Error(
        `Database error: ${error instanceof Error ? error.message : "Unknown"}`,
      );
    }

    if (!existingOrder) {
      console.error("Order not found with ID:", id);
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    if (existingOrder.status === status) {
      console.log("Order already has this status");
      return NextResponse.json(
        { success: false, message: "Cannot set the same status" },
        { status: 400 },
      );
    }

    // 5. Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    console.log("Preparing update data for status:", status);

    // Set timestamps based on status transitions
    switch (status) {
      case "PENDING":
        updateData.estimatedReadyTime = new Date(Date.now() + 30 * 60000);
        console.log("Set estimatedReadyTime:", updateData.estimatedReadyTime);
        break;
      case "READY":
        updateData.readyAt = new Date();
        console.log("Set readyAt:", updateData.readyAt);
        break;
      case "SERVED":
        updateData.servedAt = new Date();
        console.log("Set servedAt:", updateData.servedAt);
        break;
      case "COMPLETED":
        updateData.completedAt = new Date();
        console.log("Set completedAt:", updateData.completedAt);
        if (existingOrder.paymentStatus === "PENDING") {
          updateData.paymentStatus = "PAID";
          console.log("Updated payment status to PAID");
        }
        break;
      case "CANCELLED":
        updateData.cancelledAt = new Date();
        updateData.cancellationReason =
          cancellationReason || "No reason provided";
        console.log("Set cancelledAt and cancellationReason");

        if (existingOrder.paymentStatus === "PAID") {
          updateData.paymentStatus = "REFUNDED";
          console.log("Updated payment status to REFUNDED");
        }
        break;
    }

    console.log("Final updateData:", JSON.stringify(updateData, null, 2));

    // 6. Execute transaction
    console.log("Starting database transaction...");
    let result;
    try {
      result = await db.$transaction(async (tx) => {
        console.log("Inside transaction - updating order...");

        // Update the order
        const updatedOrder = await tx.order.update({
          where: { id },
          data: updateData,
        });
        console.log("Order updated successfully:", updatedOrder.id);

        // Handle loyalty points when order is completed
        if (status === "COMPLETED") {
          console.log("Processing loyalty points for completed order...");
          const pointsEarned = Math.floor(updatedOrder.finalAmount / 10);
          console.log(
            `Points to earn: ${pointsEarned} (${updatedOrder.finalAmount} / 10 = ${pointsEarned})`,
          );

          if (pointsEarned > 0) {
            try {
              // Update user's loyalty points
              const updatedUser = await tx.user.update({
                where: { id: existingOrder.userId },
                data: {
                  loyalityPoints: {
                    increment: pointsEarned,
                  },
                },
              });
              console.log(
                `User ${existingOrder.userId} points updated: ${updatedUser.loyalityPoints}`,
              );

              // Create loyalty transaction record
              const transaction = await tx.loyaltyTransaction.create({
                data: {
                  userId: existingOrder.userId,
                  points: pointsEarned,
                  type: "EARNED",
                  orderId: updatedOrder.id,
                  description: `Earned ${pointsEarned} points from order #${updatedOrder.orderNumber}`,
                },
              });
              console.log("Loyalty transaction created:", transaction.id);
            } catch (error) {
              console.error("Error in loyalty points processing:", error);
              throw error; // Re-throw to rollback transaction
            }
          } else {
            console.log("No points earned (order amount too small)");
          }
        }

        // Handle points reversal if order is cancelled after points were earned
        if (status === "CANCELLED" && existingOrder.status === "COMPLETED") {
          console.log(
            "Processing points reversal for cancelled completed order...",
          );

          // Check if points were already earned for this order
          const existingPoints = await tx.loyaltyTransaction.findFirst({
            where: {
              orderId: id,
              type: "EARNED",
            },
          });
          console.log(
            "Existing points found:",
            existingPoints ? `${existingPoints.points} points` : "None",
          );

          if (existingPoints) {
            try {
              // Reverse the points
              const updatedUser = await tx.user.update({
                where: { id: existingOrder.userId },
                data: {
                  loyalityPoints: {
                    decrement: existingPoints.points,
                  },
                },
              });
              console.log(
                `User points reversed: ${updatedUser.loyalityPoints}`,
              );

              // Create reversal transaction record
              const reversalTransaction = await tx.loyaltyTransaction.create({
                data: {
                  userId: existingOrder.userId,
                  points: existingPoints.points,
                  type: "REDEEMED",
                  orderId: id,
                  description: `Points reversed for cancelled order #${existingOrder.orderNumber}`,
                },
              });
              console.log(
                "Reversal transaction created:",
                reversalTransaction.id,
              );
            } catch (error) {
              console.error("Error in points reversal:", error);
              throw error;
            }
          }
        }

        return updatedOrder;
      });
      console.log("Transaction completed successfully");
    } catch (error) {
      console.error("Transaction failed:", error);
      throw new Error(
        `Transaction error: ${error instanceof Error ? error.message : "Unknown"}`,
      );
    }

    // 7. Create notifications outside transaction
    console.log("Creating notifications...");
    try {
      if (status === "COMPLETED") {
        const pointsEarned = Math.floor(existingOrder.finalAmount / 10);
        if (pointsEarned > 0) {
          await db.notification.create({
            data: {
              userId: existingOrder.userId,
              type: "LOYALTY_POINTS_EARNED",
              title: "Loyalty Points Earned!",
              message: `You earned ${pointsEarned} points from order #${existingOrder.orderNumber}`,
              orderId: id,
            },
          });
          console.log("Points earned notification created");
        }
      }

      if (status === "CANCELLED" && existingOrder.status === "COMPLETED") {
        const existingPoints = await db.loyaltyTransaction.findFirst({
          where: {
            orderId: id,
            type: "EARNED",
          },
        });

        if (existingPoints) {
          await db.notification.create({
            data: {
              userId: existingOrder.userId,
              type: "LOYALTY_POINTS_REDEEMED",
              title: "Points Reversed",
              message: `${existingPoints.points} points have been reversed for cancelled order #${existingOrder.orderNumber}`,
              orderId: id,
            },
          });
          console.log("Points reversal notification created");
        }
      }
    } catch (error) {
      console.error("Error creating notifications:", error);
      // Don't throw here - notifications are not critical
    }

    console.log("=== ORDER STATUS UPDATE SUCCESS ===");

    return NextResponse.json(
      {
        success: true,
        message:
          status === "COMPLETED"
            ? `Order completed! You earned ${Math.floor(existingOrder.finalAmount / 10)} loyalty points.`
            : "Order status updated successfully",
        order: {
          id: result.id,
          orderNumber: result.orderNumber,
          status: result.status,
          finalAmount: result.finalAmount,
          pointsEarned:
            status === "COMPLETED"
              ? Math.floor(existingOrder.finalAmount / 10)
              : undefined,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("=== ORDER STATUS UPDATE ERROR ===");
    console.error(
      "Error type:",
      error instanceof Error ? error.constructor.name : typeof error,
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );

    // Check for specific Prisma errors
    if (error instanceof Error && "code" in error) {
      console.error("Prisma error code:", (error as any).code);
      console.error("Prisma error meta:", (error as any).meta);
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
        details:
          process.env.NODE_ENV === "development"
            ? {
                name: error instanceof Error ? error.name : "Unknown",
                stack: error instanceof Error ? error.stack : undefined,
              }
            : undefined,
      },
      { status: 500 },
    );
  }
}
