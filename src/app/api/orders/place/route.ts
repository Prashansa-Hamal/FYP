import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUser } from "@/data/user";
import { CartItem } from "@/types/cart";
import { sendOrderConfirmationEmail } from "@/lib/email-service";

interface PlaceOrderRequest {
  orderType?: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  tableNumber?: number;
  deliveryAddressId?: string;
  specialInstruction: string;
  paymentMethod?: "COD" | "ESEWA" | "KHALTI";
}

export async function POST(request: NextRequest) {
  try {
    // 1. Get user/session
    const user = await getUser();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session_id")?.value;

    if (!user && !sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required to place an order",
          order: null,
        },
        { status: 401 },
      );
    }

    const currentUser = await db.user.findUnique({ where: { id: user?.id } });

    if (!currentUser && user?.id) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 },
      );
    }

    // 2. Parse request body
    const body: PlaceOrderRequest = await request.json();

    // Basic validation based on order type
    if (body.orderType === "DINE_IN" && !body.tableNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Table number is required for dine-in orders",
          order: null,
        },
        { status: 400 },
      );
    }

    if (body.orderType === "DELIVERY" && !body.deliveryAddressId) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery address is required for delivery orders",
          order: null,
        },
        { status: 400 },
      );
    }

    // 3. Get cart with items
    let cart;

    if (user?.id) {
      cart = await db.cart.findUnique({
        where: { userId: user.id },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });
    } else if (sessionId) {
      cart = await db.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });
    }

    // 4. Check cart exists and has items
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty",
          order: null,
        },
        { status: 400 },
      );
    }

    // 5. Validate item availability
    const unavailableItems = cart.items
      .filter((item) => !item.menuItem.isAvailable)
      .map((item) => item.menuItem.name);

    if (unavailableItems.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Some items are no longer available",
          unavailableItems,
          order: null,
        },
        { status: 400 },
      );
    }

    // 6. Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.menuItem.price,
      0,
    );

    // Fixed tax rate (adjust as needed)
    const TAX_RATE = 0.13;
    const taxAmount = subtotal * TAX_RATE;
    const discountAmount = 0; // You can add discount logic later
    const finalAmount = subtotal + taxAmount - discountAmount;

    // 7. Determine user ID (use 'guest' for non-authenticated)
    const userId = user?.id || "guest";

    // 8. Create order in transaction
    const order = await db.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderType: body.orderType || "DINE_IN",
          tableNumber: body.tableNumber,
          deliveryAddressId: body.deliveryAddressId,
          specialInstructions: body.specialInstruction,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: body.paymentMethod,
          totalAmount: subtotal,
          taxAmount,
          discountAmount,
          finalAmount,
          estimatedReadyTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        },
      });

      // Create order items
      const orderItems = await Promise.all(
        cart.items.map(async (cartItem: CartItem) => {
          const orderItem = await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              menuItemId: cartItem.menuItemId,
              quantity: cartItem.quantity,
              unitPrice: cartItem.menuItem.price,
              totalPrice: cartItem.quantity * cartItem.menuItem.price,
            },
          });

          // Create station assignments for each menu item
          await tx.orderStationAssignment.create({
            data: {
              orderItemId: orderItem.id,
              station: cartItem.menuItem.preparationStation!,
              status: "PENDING",
            },
          });

          return orderItem;
        }),
      );

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // If guest cart, delete the cart
      if (cart.sessionId) {
        await tx.cart.delete({
          where: { id: cart.id },
        });
      }

      // Create notification for user only (if logged in)
      if (user?.id) {
        await tx.notification.create({
          data: {
            userId: user.id,
            type: "ORDER_PLACED",
            title: "Order Placed Successfully! 🎉",
            message: `Your order #${newOrder.orderNumber} has been placed successfully. You will be notified when your order is ready.`,
            orderId: newOrder.id,
            isRead: false,
          },
        });
        console.log("Notification created for user:", user.id);
      }

      return {
        ...newOrder,
        items: orderItems,
      };
    });

    // 9. If payment method is not CASH, create payment record
    if (body.paymentMethod && body.paymentMethod !== "COD") {
      await db.payment.create({
        data: {
          orderId: order.id,
          amount: order.finalAmount,
          paymentMethod: body.paymentMethod,
          status: "PENDING",
        },
      });
    }

    // 10. Send confirmation email to customer (if logged in)
    if (currentUser?.email && user?.id) {
      try {
        const orderItemsForEmail = cart.items.map((item) => ({
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.menuItem.price,
        }));

        await sendOrderConfirmationEmail(
          currentUser.email,
          currentUser.name || "Valued Customer",
          order.orderNumber,
          orderItemsForEmail,
          order.finalAmount,
          order.orderType,
          order.estimatedReadyTime || undefined,
        );
        console.log("Order confirmation email sent to:", currentUser.email);
      } catch (emailError) {
        console.log("Failed to send order confirmation email:", emailError);
        // Don't fail the order if email fails
      }
    }

    // 11. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully!",
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          orderType: order.orderType,
          tableNumber: order.tableNumber,
          finalAmount: order.finalAmount,
          estimatedReadyTime: order.estimatedReadyTime,
          itemCount: cart.items.length,
          items: cart.items.map((item) => ({
            name: item.menuItem.name,
            quantity: item.quantity,
            price: item.menuItem.price,
            total: item.quantity * item.menuItem.price,
          })),
          createdAt: order.createdAt,
        },
        paymentInfo: {
          requiresPayment: body.paymentMethod && body.paymentMethod !== "COD",
          paymentMethod: body.paymentMethod,
          amount: finalAmount,
          // Add this if you want to initiate payment immediately
          initiatePayment: body.paymentMethod !== "COD",
        },
        nextSteps: getNextSteps(order.orderType, order.paymentMethod!),
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.log("Order placement error:", error);

    // Handle specific errors
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "Duplicate order detected. Please try again.",
          order: null,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to place order. Please try again.",
        order: null,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// Helper function for next steps
function getNextSteps(orderType: string, paymentMethod?: string) {
  const steps: string[] = [];

  if (!paymentMethod || paymentMethod === "COD") {
    steps.push("Payment will be collected upon pickup/delivery");
  } else {
    steps.push("Payment will be processed shortly");
  }

  switch (orderType) {
    case "DINE_IN":
      steps.push("Your order will be served within 30-45 minutes");
      break;
    case "TAKEAWAY":
      steps.push("Your order will be ready for pickup in 30-45 minutes");
      steps.push("Bring your order number to the counter");
      break;
    case "DELIVERY":
      steps.push("Your order will be delivered within 30-45 minutes");
      steps.push("Keep your phone handy for delivery updates");
      break;
  }

  steps.push("You can track your order status");

  return steps;
}
