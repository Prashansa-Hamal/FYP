import db from "@/lib/db";
import { PREPARATION_STATIONS, PreparationStation } from "@/types/enums";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch active orders for a specific station directly from OrderStationAssignment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ station: string }> },
) {
  try {
    const { station } = await params;

    // Validate station
    if (
      !Object.values(PREPARATION_STATIONS).includes(
        station as PreparationStation,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid station",
          validStations: Object.values(PREPARATION_STATIONS),
        },
        { status: 400 },
      );
    }

    // Get active station assignments with all needed data
    const stationAssignments = await db.orderStationAssignment.findMany({
      where: {
        station: station as PreparationStation,
        status: { in: ["PENDING", "IN_PROGRESS"] }, // Only active items
        orderItem: {
          order: {
            status: {
              notIn: ["SERVED", "COMPLETED", "CANCELLED"],
            },
          },
        },
      },
      include: {
        orderItem: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
                preparationTime: true,
              },
            },
            order: {
              include: {
                user: {
                  select: {
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { createdAt: "asc" }, // Oldest first
        { status: "asc" }, // PENDING before IN_PROGRESS
      ],
    });

    // Group assignments by order for easier consumption
    const ordersMap = new Map<string, any>();

    for (const assignment of stationAssignments) {
      const orderId = assignment.orderItem.order.id;

      if (!ordersMap.has(orderId)) {
        const order = assignment.orderItem.order;
        ordersMap.set(orderId, {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          orderType: order.orderType,
          tableNumber: order.tableNumber,
          customerName: order.user?.name || "Guest",
          customerPhone: order.user?.phone,
          createdAt: order.createdAt,
          estimatedReadyTime: order.estimatedReadyTime,
          specialInstructions: order.specialInstructions,
          items: [],
          stationProgress: {
            total: 0,
            ready: 0,
            inProgress: 0,
            pending: 0,
          },
        });
      }

      const orderData = ordersMap.get(orderId)!;
      const item = assignment.orderItem;

      orderData.items.push({
        assignmentId: assignment.id,
        orderItemId: item.id,
        menuItemId: item.menuItemId,
        name: item.menuItem.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        specialInstructions: item.specialInstructions,
        preparationTime: item.menuItem.preparationTime,
        isReady: item.isReady,
        readyAt: item.readyAt,
        stationStatus: assignment.status,
        assignedTo: assignment.assignedTo,
        startedAt: assignment.startedAt,
        completedAt: assignment.completedAt,
        estimatedCompletionTime: assignment.estimatedCompletionTime,
      });
    }

    // Calculate station progress for each order
    const formattedOrders = Array.from(ordersMap.values()).map((order) => {
      const totalItems = order.items.length;
      const readyItems = order.items.filter((item: any) => item.isReady).length;
      const inProgressItems = order.items.filter(
        (item: any) => item.stationStatus === "IN_PROGRESS",
      ).length;
      const pendingItems = totalItems - readyItems - inProgressItems;

      return {
        ...order,
        stationProgress: {
          total: totalItems,
          ready: readyItems,
          inProgress: inProgressItems,
          pending: pendingItems,
          percentage:
            totalItems > 0 ? Math.round((readyItems / totalItems) * 100) : 0,
        },
        stationSubtotal: order.items.reduce(
          (sum: number, item: any) => sum + item.totalPrice,
          0,
        ),
        stationItemCount: totalItems,
      };
    });

    // Separate into pending and ready orders
    const pendingOrders = formattedOrders.filter(
      (order) => order.stationProgress.percentage < 100,
    );

    const readyOrders = formattedOrders.filter(
      (order) => order.stationProgress.percentage === 100,
    );

    // Calculate summary stats
    const summary = {
      totalOrders: formattedOrders.length,
      pendingOrders: pendingOrders.length,
      readyOrders: readyOrders.length,
      totalItems: formattedOrders.reduce(
        (sum, order) => sum + order.stationItemCount,
        0,
      ),
      pendingItems: formattedOrders.reduce(
        (sum, order) => sum + order.stationProgress.pending,
        0,
      ),
      inProgressItems: formattedOrders.reduce(
        (sum, order) => sum + order.stationProgress.inProgress,
        0,
      ),
      readyItems: formattedOrders.reduce(
        (sum, order) => sum + order.stationProgress.ready,
        0,
      ),
    };

    return NextResponse.json({
      success: true,
      station: station,
      data: {
        pending: pendingOrders,
        ready: readyOrders,
        all: formattedOrders,
      },
      summary,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(`GET /api/orders/station/[station] error:`, error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch station orders",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
