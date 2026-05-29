import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";

// PATCH /api/tables/[id]/status - Update table status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getUser();

    // Check if user is admin or staff
    if (
      !user ||
      (user.role !== "ADMIN" &&
        user.role !== "MANAGER" &&
        user.role !== "WAITER")
    ) {
      return NextResponse.json(
        { error: "Unauthorized. Staff access required." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    // Validate status
    const validStatuses = [
      "AVAILABLE",
      "OCCUPIED",
      "RESERVED",
      "OUT_OF_SERVICE",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const table = await db.table.update({
      where: { id },
      data: {
        status,
        isAvailable: status === "AVAILABLE",
      },
    });

    // Log status change (optional)
    await db.notification.create({
      data: {
        userId: user.id,
        type: "GENERAL_ANNOUNCEMENT",
        title: "Table Status Updated",
        message: `Table ${table.tableNumber} status changed to ${status}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: table,
      message: `Table status updated to ${status}`,
    });
  } catch (error) {
    console.log("Error updating table status:", error);
    return NextResponse.json(
      {
        error: "Failed to update table status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
