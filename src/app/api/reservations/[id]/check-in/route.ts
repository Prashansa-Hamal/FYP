import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getUser();
    const { id } = await params;

    // Check if user is staff
    if (
      user?.role !== "ADMIN" &&
      user?.role !== "MANAGER" &&
      user?.role !== "WAITER"
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Staff only" },
        { status: 403 },
      );
    }

    const reservation = await db.reservation.findUnique({
      where: { id },
      include: { tables: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, message: "Reservation not found" },
        { status: 404 },
      );
    }

    if (reservation.status !== "CONFIRMED") {
      return NextResponse.json(
        { success: false, message: "Reservation cannot be checked in" },
        { status: 400 },
      );
    }

    const checkedInReservation = await db.$transaction(async (tx) => {
      // Update reservation
      const updated = await tx.reservation.update({
        where: { id },
        data: {
          status: "COMPLETED",
          checkedInAt: new Date(),
          completedAt: new Date(),
        },
      });

      // Update table status to OCCUPIED
      const tableNumbers = reservation.tables.map((t) => t.tableNumber);
      await tx.table.updateMany({
        where: { tableNumber: { in: tableNumbers } },
        data: { status: "OCCUPIED" },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      data: checkedInReservation,
      message: "Reservation checked in successfully",
    });
  } catch (error) {
    console.error("PATCH /api/reservations/[id]/check-in error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check in reservation",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
