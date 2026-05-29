import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";
import { checkTablesAvailability } from "@/lib/reservation-helpers";
import { sendReservationCancelledEmail } from "@/lib/email-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();
    const { id } = await params;

    const reservation = await db.reservation.findUnique({
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
        tables: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, message: "Reservation not found" },
        { status: 404 },
      );
    }

    // Check authorization
    if (
      user?.role !== "ADMIN" &&
      user?.role !== "MANAGER" &&
      reservation.userId !== user?.id
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      data: reservation,
      message: "Reservation fetched successfully",
    });
  } catch (error) {
    console.log("GET /api/reservations/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reservation",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();
    const { id } = await params;

    // Check if reservation exists
    const existingReservation = await db.reservation.findUnique({
      where: { id },
      include: {
        tables: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!existingReservation) {
      return NextResponse.json(
        { success: false, message: "Reservation not found" },
        { status: 404 },
      );
    }

    // Check authorization
    if (
      user?.role !== "ADMIN" &&
      user?.role !== "MANAGER" &&
      existingReservation.userId !== user?.id
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      reservationDate,
      partySize,
      tableNumbers,
      specialRequests,
      status,
    } = body;

    // Start transaction
    const updatedReservation = await db.$transaction(async (tx) => {
      let finalTableNumbers = existingReservation.tables.map(
        (t) => t.tableNumber,
      );
      let finalPartySize = partySize || existingReservation.partySize;
      let finalReservationDate = reservationDate
        ? new Date(reservationDate)
        : existingReservation.reservationDate;

      // CRITICAL FIX: Validate table capacity for the party size
      if (tableNumbers || partySize) {
        // Get current tables if not specified
        if (tableNumbers) {
          finalTableNumbers = tableNumbers;
        }

        // Get the tables that will be used
        const assignedTables = await tx.table.findMany({
          where: {
            tableNumber: { in: finalTableNumbers },
          },
        });

        // Calculate total capacity
        const totalCapacity = assignedTables.reduce(
          (sum, table) => sum + table.capacity,
          0,
        );

        // Validate capacity
        if (totalCapacity < finalPartySize) {
          throw new Error(
            `Selected tables can only accommodate ${totalCapacity} people, but you have ${finalPartySize} people. Please select more tables or reduce party size.`,
          );
        }

        // Check if tables are available for the new date/time
        if (reservationDate || tableNumbers) {
          const areTablesAvailable = await checkTablesAvailability(
            finalTableNumbers,
            finalReservationDate,
            id, // Exclude current reservation
          );

          if (!areTablesAvailable) {
            throw new Error(
              "Selected tables are not available for the new time. Please choose a different time or tables.",
            );
          }
        }

        // Update table statuses if tables changed
        if (tableNumbers) {
          // Free old tables
          const oldTableNumbers = existingReservation.tables.map(
            (t) => t.tableNumber,
          );
          await tx.table.updateMany({
            where: { tableNumber: { in: oldTableNumbers } },
            data: { status: "AVAILABLE" },
          });

          // Book new tables
          await tx.table.updateMany({
            where: { tableNumber: { in: finalTableNumbers } },
            data: { status: "RESERVED" },
          });

          // Update reservation tables
          await tx.reservation.update({
            where: { id },
            data: {
              tables: {
                set: finalTableNumbers.map((num) => ({ tableNumber: num })),
              },
            },
          });
        }
      }

      // Validate that party size doesn't exceed table capacity even if tables aren't changing
      if (partySize && partySize !== existingReservation.partySize) {
        const currentTables = await tx.table.findMany({
          where: {
            tableNumber: {
              in: existingReservation.tables.map((t) => t.tableNumber),
            },
          },
        });

        const currentCapacity = currentTables.reduce(
          (sum, table) => sum + table.capacity,
          0,
        );

        if (currentCapacity < partySize) {
          throw new Error(
            `Current tables can only accommodate ${currentCapacity} people, but you have ${partySize} people. Please add more tables or reduce party size.`,
          );
        }
      }

      // Update reservation details
      return await tx.reservation.update({
        where: { id },
        data: {
          reservationDate: reservationDate
            ? new Date(reservationDate)
            : undefined,
          partySize: partySize,
          specialRequests,
          status,
        },
        include: {
          tables: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });
    });

    // Create notification for user about the update
    if (reservationDate || partySize || tableNumbers) {
      await db.notification.create({
        data: {
          userId: existingReservation.userId,
          type: "GENERAL_ANNOUNCEMENT",
          title: "Reservation Updated",
          message: `Your reservation has been updated. ${partySize ? `New party size: ${partySize} people. ` : ""}${reservationDate ? `New date: ${new Date(reservationDate).toLocaleString()}` : ""}`,
          isRead: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedReservation,
      message: "Reservation updated successfully",
    });
  } catch (error) {
    console.log("PUT /api/reservations/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update reservation",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();
    const { id } = await params;

    if (!user?.id) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 },
      );
    }

    const currentUser = await db.user.findUnique({ where: { id: user.id } });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 },
      );
    }

    const existingReservation = await db.reservation.findUnique({
      where: { id },
      include: { tables: true },
    });

    if (!existingReservation) {
      return NextResponse.json(
        { success: false, message: "Reservation not found" },
        { status: 404 },
      );
    }

    // Check authorization
    if (
      user?.role !== "ADMIN" &&
      user?.role !== "MANAGER" &&
      existingReservation.userId !== user?.id
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    // Cancel reservation instead of deleting
    const cancelledReservation = await db.$transaction(async (tx) => {
      // Free up tables
      const tableNumbers = existingReservation.tables.map((t) => t.tableNumber);
      await tx.table.updateMany({
        where: { tableNumber: { in: tableNumbers } },
        data: { status: "AVAILABLE" },
      });

      // Update reservation status
      return await tx.reservation.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });
    });

    // Create notification
    // await db.notification.create({
    //   data: {
    //     userId: existingReservation.userId,
    //     type: "GENERAL_ANNOUNCEMENT",
    //     title: "Reservation Cancelled",
    //     message: `Your reservation for ${existingReservation.partySize} people on ${existingReservation.reservationDate.toLocaleString()} has been cancelled.`,
    //     isRead: false,
    //   },
    // });

    await db.notification.create({
      data: {
        userId: existingReservation.userId,
        type: "RESERVATION_CANCELLED",
        title: "Reservation Cancelled",
        message: `Your reservation for ${existingReservation.partySize} ${
          existingReservation.partySize === 1 ? "person" : "people"
        } on ${new Date(existingReservation.reservationDate).toLocaleString()} has been cancelled.${
          user?.role === "ADMIN" || user?.role === "MANAGER"
            ? ` Cancelled by ${currentUser.name || "Staff"}.`
            : ""
        }`,
        isRead: false,
      },
    });

    const reservedBy = await db.user.findUnique({
      where: { id: existingReservation.userId },
    });

    if (!reservedBy) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 },
      );
    }

    // Send cancellation email to the customer
    try {
      await sendReservationCancelledEmail(
        reservedBy.email,
        reservedBy.name || "Valued Customer",
        existingReservation.reservationDate,
        existingReservation.partySize,
        user?.role === "ADMIN" || user?.role === "MANAGER"
          ? currentUser.name
          : undefined,
      );
      console.log("Reservation cancellation email sent to:", reservedBy.email);
    } catch (emailError) {
      console.log("Failed to send cancellation email:", emailError);
      // Don't fail the cancellation if email fails
    }

    return NextResponse.json({
      success: true,
      data: cancelledReservation,
      message: "Reservation cancelled successfully",
    });
  } catch (error) {
    console.log("DELETE /api/reservations/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to cancel reservation",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
