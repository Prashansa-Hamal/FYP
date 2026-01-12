// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET - Fetch all orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Build filter object
    const where: any = {};

    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const orderType = searchParams.get("orderType");
    const userId = searchParams.get("userId");

    // Handle search filter
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Handle status filter - support multiple statuses comma-separated
    if (status) {
      const statuses = status.split(",").filter(Boolean);

      if (statuses.length === 1) {
        where.status = statuses[0];
      } else if (statuses.length > 1) {
        where.status = { in: statuses };
      }
    }

    // Handle payment status filter
    if (paymentStatus) {
      const paymentStatuses = paymentStatus.split(",").filter(Boolean);

      if (paymentStatuses.length === 1) {
        where.paymentStatus = paymentStatuses[0];
      } else if (paymentStatuses.length > 1) {
        where.paymentStatus = { in: paymentStatuses };
      }
    }

    // Handle order type filter
    if (orderType) {
      const orderTypes = orderType.split(",").filter(Boolean);

      if (orderTypes.length === 1) {
        where.orderType = orderTypes[0];
      } else if (orderTypes.length > 1) {
        where.orderType = { in: orderTypes };
      }
    }

    // Handle user filter
    if (userId) {
      where.userId = userId;
    }

    // Date range filters
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Execute query
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
                  price: true,
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              paymentMethod: true,
              status: true,
              transactionId: true,
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
          _count: {
            select: {
              items: true,
              payments: true,
            },
          },
        },
      }),
      db.order.count({ where }),
    ]);

    // Format response
    const formattedOrders = orders.map((order) => ({
      ...order,
      userName: order.user.name,
      userEmail: order.user.email,
      userPhone: order.user.phone,
      itemCount: order._count.items,
      user: undefined,
      _count: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
