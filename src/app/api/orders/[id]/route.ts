// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET - Fetch single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Fetch order with all related data
    const order = await db.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                category: true,
                preparationStation: true,
                preparationTime: true,
                isVegetarian: true,
                isSpicy: true,
                isAlcoholic: true,
                imageUrl: true,
              },
            },
          },
        },
        deliveryAddress: {
          select: {
            street: true,
            city: true,
            state: true,
            postalCode: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            status: true,
            transactionId: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
          code: "ORDER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Calculate statistics
    const totalItems = order.items.length;
    const readyItems = order.items.filter((item) => item.isReady).length;
    const preparationProgress =
      totalItems > 0 ? Math.round((readyItems / totalItems) * 100) : 0;

    // Calculate total paid amount
    const paidAmount = order.payments
      .filter((p) => p.status === "PAID")
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Structure the response
    const response = {
      success: true,
      data: {
        ...order,
        statistics: {
          totalItems,
          readyItems,
          preparationProgress,
          paidAmount,
          balance: order.finalAmount - paidAmount,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order details",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
        code: "ORDER_FETCH_ERROR",
      },
      { status: 500 }
    );
  }
}
