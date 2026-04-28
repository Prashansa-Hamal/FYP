import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { cookies } from "next/headers";
import { getUser } from "@/data/user";

const roundToTwo = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;
const VAT_RATE = 0.13;

export async function POST(request: NextRequest) {
  try {
    const { addressId, orderType, specialInstruction } = await request.json();

    console.log("AddressId", addressId);
    console.log("OrderType", orderType);

    // Validate order type
    if (
      !orderType ||
      !["DELIVERY", "DINE_IN", "TAKEAWAY"].includes(orderType)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid order type (DELIVERY, DINE_IN, or TAKEAWAY) is required",
        },
        { status: 400 },
      );
    }

    // Only validate address for delivery orders
    if (orderType === "DELIVERY") {
      if (!addressId) {
        return NextResponse.json(
          {
            success: false,
            message: "Address is required for delivery orders",
          },
          { status: 400 },
        );
      }
    }

    const cookieStore = await cookies();
    let sessionId = cookieStore.get("cart_session_id")?.value;
    const user = await getUser();

    let cart;

    // Find cart based on user or session
    if (user?.id) {
      cart = await db.cart.findUnique({
        where: { userId: user.id },
        include: {
          items: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                  category: true,
                  isAvailable: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    } else if (sessionId) {
      cart = await db.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                  category: true,
                  isAvailable: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    // Handle empty or non-existent cart
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({
        success: true,
        message: !cart ? "Cart not found" : "Your cart is empty",
        cart: null,
        summary: {
          itemCount: 0,
          subtotal: 0,
          vatAmount: 0,
          discountAmount: 0,
          totalAmount: 0,
          items: [],
          unavailableItems: [],
          deliveryAddress: null,
        },
      });
    }

    // Separate available and unavailable items
    const availableItems = cart.items.filter(
      (item) => item.menuItem.isAvailable,
    );
    const unavailableItems = cart.items.filter(
      (item) => !item.menuItem.isAvailable,
    );

    // Calculate summary only for available items
    const subtotal = availableItems.reduce(
      (sum, item) => sum + item.quantity * item.menuItem.price,
      0,
    );

    const vatAmount = subtotal * VAT_RATE;
    const discountAmount = 0; // Implement discount logic
    const totalAmount = subtotal + vatAmount - discountAmount;

    let deliveryAddress = null;

    // Only fetch and validate address for delivery orders
    if (orderType === "DELIVERY" && addressId) {
      // Verify address exists and belongs to the user if logged in
      if (user?.id) {
        deliveryAddress = await db.address.findFirst({
          where: {
            id: addressId,
            userId: user.id,
          },
          select: {
            id: true,
            name: true,
            phone: true,
            city: true,
            country: true,
            state: true,
            postalCode: true,
            street: true,
          },
        });
      } else {
        // For guest users, just check if address exists
        deliveryAddress = await db.address.findUnique({
          where: { id: addressId },
          select: {
            id: true,
            name: true,
            phone: true,
            city: true,
            country: true,
            state: true,
            postalCode: true,
            street: true,
          },
        });
      }

      if (!deliveryAddress) {
        return NextResponse.json(
          {
            success: false,
            message: user?.id
              ? "Address not found or doesn't belong to you"
              : "Address not found",
          },
          { status: 404 },
        );
      }
    }

    const summary = {
      itemCount: availableItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: roundToTwo(subtotal),
      vatAmount: roundToTwo(vatAmount),
      discountAmount: roundToTwo(discountAmount),
      totalAmount: roundToTwo(totalAmount),
      orderType,
      deliveryAddress, // This will be null for DINE_IN and TAKEAWAY
      specialInstruction,
      items: availableItems.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.menuItem.name,
        price: roundToTwo(item.menuItem.price),
        quantity: item.quantity,
        imageUrl: item.menuItem.imageUrl,
        category: item.menuItem.category,
        total: roundToTwo(item.quantity * item.menuItem.price),
        isAvailable: true,
      })),
      unavailableItems: unavailableItems.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.menuItem.name,
        price: roundToTwo(item.menuItem.price),
        quantity: item.quantity,
        reason: "Currently unavailable",
      })),
    };

    return NextResponse.json({
      success: true,
      cart: {
        id: cart.id,
        userId: cart.userId,
        sessionId: cart.sessionId,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      },
      summary,
      message: "Cart summary retrieved successfully",
    });
  } catch (error: any) {
    console.error("Cart summary error:", error);

    // Handle specific error types
    if (error.name === "PrismaClientKnownRequestError") {
      return NextResponse.json(
        {
          success: false,
          message: "Database error occurred",
        },
        { status: 500 },
      );
    }

    if (error.name === "SyntaxError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request format",
        },
        { status: 400 },
      );
    }

    const errorMessage =
      process.env.NODE_ENV === "development"
        ? error.message
        : "An error occurred while fetching cart summary";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve cart summary",
        ...(process.env.NODE_ENV === "development" && { error: errorMessage }),
      },
      { status: 500 },
    );
  }
}
