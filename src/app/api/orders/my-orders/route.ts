import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";
import { OrderStatus } from "@/types/enums";

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to view your orders." },
        { status: 401 },
      );
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Log for debugging
    console.log("API - Status param:", statusParam);
    console.log("API - User ID:", user.id);

    // Build the where clause
    const whereClause: any = {
      userId: user.id,
    };

    // Filter by status if provided
    if (statusParam && statusParam !== "all" && statusParam !== "") {
      const statuses = statusParam.split(",");
      console.log("API - Statuses array:", statuses);

      if (statuses.length === 1) {
        whereClause.status = statuses[0];
      } else if (statuses.length > 1) {
        whereClause.status = {
          in: statuses,
        };
      }
    }

    console.log("API - Where clause:", JSON.stringify(whereClause, null, 2));

    // First, let's check if there are any orders at all for this user
    const totalUserOrders = await db.order.count({
      where: { userId: user.id },
    });
    console.log("API - Total orders for user:", totalUserOrders);

    // Fetch orders with their items and related data
    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                imageUrl: true,
                category: true,
                price: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        deliveryAddress: true,
        payments: {
          select: {
            amount: true,
            paymentMethod: true,
            status: true,
            paidAt: true,
            transactionId: true,
          },
        },
        notifications: {
          where: {
            type: {
              in: ["ORDER_READY", "ORDER_PREPARING", "ORDER_SERVED"],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        loyaltyTransactions: {
          select: {
            points: true,
            type: true,
            description: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: skip,
      take: limit,
    });

    console.log("API - Orders found:", orders.length);
    console.log(
      "API - Order statuses found:",
      orders.map((o) => o.status),
    );

    // Get total count for pagination
    const totalOrders = await db.order.count({
      where: whereClause,
    });
    console.log("API - Total orders matching filter:", totalOrders);

    // Format orders for better readability
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      finalAmount: order.finalAmount,
      discountAmount: order.discountAmount,
      taxAmount: order.taxAmount,
      specialInstructions: order.specialInstructions,
      tableNumber: order.tableNumber,
      createdAt: order.createdAt,
      estimatedReadyTime: order.estimatedReadyTime,
      readyAt: order.readyAt,
      servedAt: order.servedAt,
      completedAt: order.completedAt,
      cancelledAt: order.cancelledAt,
      cancellationReason: order.cancellationReason,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        specialInstructions: item.specialInstructions,
        isReady: item.isReady,
        readyAt: item.readyAt,
        menuItem: {
          name: item.menuItem.name,
          imageUrl: item.menuItem.imageUrl,
          category: item.menuItem.category,
          price: item.menuItem.price,
        },
      })),
      deliveryAddress: order.deliveryAddress
        ? {
            name: order.deliveryAddress.name,
            phone: order.deliveryAddress.phone,
            street: order.deliveryAddress.street,
            city: order.deliveryAddress.city,
            state: order.deliveryAddress.state,
            postalCode: order.deliveryAddress.postalCode,
            country: order.deliveryAddress.country,
          }
        : null,
      payments: order.payments.map((payment) => ({
        amount: payment.amount,
        method: payment.paymentMethod,
        status: payment.status,
        paidAt: payment.paidAt,
        transactionId: payment.transactionId,
      })),
      recentNotifications: order.notifications.map((notification) => ({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt,
      })),
      loyaltyTransactions: order.loyaltyTransactions.map((transaction) => ({
        points: transaction.points,
        type: transaction.type,
        description: transaction.description,
        createdAt: transaction.createdAt,
      })),
    }));

    // Return response with pagination metadata
    return NextResponse.json({
      success: true,
      data: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders: totalOrders,
        ordersPerPage: limit,
        hasNextPage: page * limit < totalOrders,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.log("Error fetching user orders:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
