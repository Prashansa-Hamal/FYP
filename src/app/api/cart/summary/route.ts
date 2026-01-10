import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { cookies } from "next/headers";
import { getUser } from "@/data/user";

const roundToTwo = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;
const VAT_RATE = 0.13;

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("cart_session_id")?.value;
    const user = await getUser();

    let cart;

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
        message: cart ? "Your cart is empty" : "Cart not found",
        cart: cart ? { id: cart.id } : null,
        summary: {
          itemCount: 0,
          subtotal: 0,
          taxAmount: 0,
          discountAmount: 0,
          totalAmount: 0,
          items: [],
          unavailableItems: [],
        },
      });
    }

    // Separate available and unavailable items
    const availableItems = cart.items.filter(
      (item) => item.menuItem.isAvailable
    );
    const unavailableItems = cart.items.filter(
      (item) => !item.menuItem.isAvailable
    );

    // Calculate summary only for available items
    const subtotal = availableItems.reduce(
      (sum, item) => sum + item.quantity * item.menuItem.price,
      0
    );

    const vatAmount = subtotal * VAT_RATE;
    const discountAmount = 0; // Implement discount logic
    const totalAmount = subtotal + vatAmount - discountAmount;

    const summary = {
      itemCount: availableItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: roundToTwo(subtotal),
      vatAmount: roundToTwo(vatAmount),
      discountAmount: roundToTwo(discountAmount),
      totalAmount: roundToTwo(totalAmount),
      items: availableItems.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.menuItem.name,
        price: roundToTwo(item.menuItem.price),
        quantity: item.quantity,
        imageUrl: item.menuItem.imageUrl,
        category: item.menuItem.category,
        specialInstructions: item.specialInstructions,
        total: roundToTwo(item.quantity * item.menuItem.price),
        isAvailable: true,
      })),
      unavailableItems: unavailableItems.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.menuItem.name,
        price: item.menuItem.price,
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

    const errorMessage =
      process.env.NODE_ENV === "development"
        ? error.message
        : "An error occurred while fetching cart summary";

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve cart summary",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
