import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { tableNumber } = await request.json();

    if (!tableNumber) {
      return NextResponse.json(
        { success: false, message: "Table number is required" },
        { status: 400 },
      );
    }

    const latestOrder = await db.order.findFirst({
      where: { tableNumber },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: latestOrder });
  } catch (error) {
    console.error("Error fetching table order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch table order" },
      { status: 500 },
    );
  }
}
