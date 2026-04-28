import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const partySize = parseInt(searchParams.get("partySize") || "1");
    const timeSlot = searchParams.get("timeSlot"); // Optional: e.g., "18:00"

    if (!date) {
      return NextResponse.json(
        { success: false, message: "Date is required" },
        { status: 400 },
      );
    }

    const startDateTime = new Date(date);
    let endDateTime = new Date(date);

    if (timeSlot) {
      // If specific time slot is provided, check 2-hour window
      const [hours, minutes] = timeSlot.split(":");
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
      endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + 2);
    } else {
      // Check whole day
      startDateTime.setHours(0, 0, 0, 0);
      endDateTime.setHours(23, 59, 59, 999);
    }

    // Get all tables
    const allTables = await db.table.findMany({
      orderBy: { tableNumber: "asc" },
    });

    // Get reservations for the time period
    const conflictingReservations = await db.reservation.findMany({
      where: {
        reservationDate: {
          gte: startDateTime,
          lt: endDateTime,
        },
        status: { not: "CANCELLED" },
      },
      include: {
        tables: true,
      },
    });

    // Get booked table numbers
    const bookedTableNumbers = new Set();
    conflictingReservations.forEach((res) => {
      res.tables.forEach((table) => {
        bookedTableNumbers.add(table.tableNumber);
      });
    });

    // Filter available tables
    const availableTables = allTables.filter(
      (table) =>
        !bookedTableNumbers.has(table.tableNumber) &&
        table.capacity >= partySize,
    );

    // Calculate best table combinations
    const combinations = findTableCombinations(availableTables, partySize);

    return NextResponse.json({
      success: true,
      data: {
        availableTables,
        combinations,
        totalAvailable: availableTables.length,
        requestedPartySize: partySize,
        timeSlot: timeSlot || "Any time",
      },
      message: "Available tables fetched successfully",
    });
  } catch (error) {
    console.error("GET /api/reservations/available-tables error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch available tables",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Helper function to find table combinations
function findTableCombinations(tables: any[], partySize: number) {
  const combinations = [];

  // Single table
  for (const table of tables) {
    if (table.capacity >= partySize) {
      combinations.push({
        tables: [table],
        totalCapacity: table.capacity,
        numberOfTables: 1,
      });
    }
  }

  // Multiple tables (simplified - just pairs)
  for (let i = 0; i < tables.length; i++) {
    for (let j = i + 1; j < tables.length; j++) {
      const totalCapacity = tables[i].capacity + tables[j].capacity;
      if (totalCapacity >= partySize) {
        combinations.push({
          tables: [tables[i], tables[j]],
          totalCapacity,
          numberOfTables: 2,
        });
      }
    }
  }

  // Sort by number of tables (fewer is better) and then by capacity
  return combinations.sort((a, b) => {
    if (a.numberOfTables !== b.numberOfTables) {
      return a.numberOfTables - b.numberOfTables;
    }
    return a.totalCapacity - b.totalCapacity;
  });
}
