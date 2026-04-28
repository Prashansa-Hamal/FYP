import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";
import {
  checkTablesAvailability,
  getAvailableTables,
} from "@/lib/reservation-helpers";
import { EmailService } from "@/lib/email-service";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    const searchParams = request.nextUrl.searchParams;

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filter parameters
    const statusParam = searchParams.get("status");
    const partySizeParam = searchParams.get("partySize");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");

    // Parse arrays from comma-separated values
    const statuses = statusParam ? statusParam.split(",").filter(Boolean) : [];
    const partySizes = partySizeParam
      ? partySizeParam.split(",").map(Number).filter(Boolean)
      : [];

    // Build where clause
    let where: any = {};

    // If not admin, only show user's own reservations
    if (user?.role !== "ADMIN" && user?.role !== "MANAGER") {
      where.userId = user?.id;
    } else if (userId) {
      where.userId = userId;
    }

    // Status filter (supports multiple statuses)
    if (statuses.length > 0) {
      where.status = { in: statuses };
    }

    // Party size filter (supports multiple party sizes)
    if (partySizes.length > 0) {
      where.partySize = { in: partySizes };
    }

    // Date range filter
    if (startDate || endDate) {
      where.reservationDate = {};
      if (startDate) {
        where.reservationDate.gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.reservationDate.lte = endDateTime;
      }
    }

    // Search filter (by user name, email, phone, or reservation ID)
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search, mode: "insensitive" } } },
        { id: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count for pagination
    const total = await db.reservation.count({ where });

    // Get paginated reservations
    const reservations = await db.reservation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        tables: {
          select: {
            tableNumber: true,
            capacity: true,
          },
        },
      },
      orderBy: {
        reservationDate: "desc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: reservations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      message: "Reservations fetched successfully",
    });
  } catch (error) {
    console.error("GET /api/reservations error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reservations",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

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

    const body = await request.json();
    const { reservationDate, partySize, tableNumbers, specialRequests } = body;

    // Validate required fields
    if (!reservationDate || !partySize) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const reservationDateTime = new Date(reservationDate);

    // Check if reservation date is in the future
    if (reservationDateTime <= new Date()) {
      return NextResponse.json(
        { success: false, message: "Reservation date must be in the future" },
        { status: 400 },
      );
    }

    // Find available tables for the given time and party size
    const availableTables = await getAvailableTables(
      reservationDateTime,
      partySize,
    );

    if (availableTables.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No tables available for the selected time",
        },
        { status: 400 },
      );
    }

    // Select tables (either specified or first available)
    let selectedTableNumbers = tableNumbers;
    if (!selectedTableNumbers || selectedTableNumbers.length === 0) {
      // Select tables that can accommodate the party size
      let remainingCapacity = partySize;
      selectedTableNumbers = [];

      for (const table of availableTables) {
        if (remainingCapacity <= 0) break;
        selectedTableNumbers.push(table.tableNumber);
        remainingCapacity -= table.capacity;
      }
    } else {
      // Verify requested tables are available
      const requestedTables = await db.table.findMany({
        where: {
          tableNumber: { in: selectedTableNumbers },
        },
      });

      const totalCapacity = requestedTables.reduce(
        (sum, t) => sum + t.capacity,
        0,
      );
      if (totalCapacity < partySize) {
        return NextResponse.json(
          {
            success: false,
            message: "Selected tables cannot accommodate party size",
          },
          { status: 400 },
        );
      }

      const areTablesAvailable = await checkTablesAvailability(
        selectedTableNumbers,
        reservationDateTime,
      );

      if (!areTablesAvailable) {
        return NextResponse.json(
          { success: false, message: "Selected tables are not available" },
          { status: 400 },
        );
      }
    }

    // Create reservation
    const reservation = await db.$transaction(async (tx) => {
      const newReservation = await tx.reservation.create({
        data: {
          userId: user.id,
          reservationDate: reservationDateTime,
          partySize,
          specialRequests,
          status: "CONFIRMED",
        },
      });

      // Connect tables to reservation
      await tx.reservation.update({
        where: { id: newReservation.id },
        data: {
          tables: {
            connect: selectedTableNumbers.map((num: number) => ({
              tableNumber: num,
            })),
          },
        },
      });

      // Update table status to RESERVED
      await tx.table.updateMany({
        where: { tableNumber: { in: selectedTableNumbers } },
        data: { status: "RESERVED" },
      });

      return newReservation;
    });

    // Create notification for user
    await db.notification.create({
      data: {
        userId: user.id,
        type: "GENERAL_ANNOUNCEMENT",
        title: "Reservation Confirmed",
        message: `Your reservation for ${partySize} people on ${reservationDateTime.toLocaleString()} has been confirmed.`,
        isRead: false,
      },
    });

    // Send confirmation email
    try {
      await EmailService.sendReservationConfirmationEmail(
        currentUser.email,
        currentUser.name || "Valued Customer",
        reservationDateTime,
        partySize,
        selectedTableNumbers,
        specialRequests,
      );
      console.log("Reservation confirmation email sent to:", currentUser.email);
    } catch (emailError) {
      console.error(
        "Failed to send reservation confirmation email:",
        emailError,
      );
      // Don't fail the reservation if email fails
    }

    return NextResponse.json({
      success: true,
      data: reservation,
      message: "Reservation created successfully",
    });
  } catch (error) {
    console.error("POST /api/reservations error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create reservation",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
