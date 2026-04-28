import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { format } from "date-fns";

// GET /api/tables/availability?date=2024-01-01&timeSlot=18:00&partySize=4
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const timeSlot = searchParams.get("timeSlot");
    const partySize = parseInt(searchParams.get("partySize") || "1");

    if (!date || !timeSlot) {
      return NextResponse.json(
        { error: "Date and timeSlot are required" },
        { status: 400 },
      );
    }

    // Combine date and time to create reservation datetime
    const reservationDateTime = new Date(`${date}T${timeSlot}:00`);

    // Get all tables
    const allTables = await db.table.findMany({
      where: {
        isAvailable: true,
        status: "AVAILABLE",
      },
      orderBy: {
        tableNumber: "asc",
      },
    });

    // Get tables that are already reserved for this time slot
    const reservedTables = await db.reservation.findMany({
      where: {
        reservationDate: reservationDateTime,
        status: {
          in: ["CONFIRMED", "PENDING"],
        },
      },
      include: {
        tables: true,
      },
    });

    // Get reserved table IDs
    const reservedTableIds = new Set(
      reservedTables.flatMap((res) => res.tables.map((t) => t.id)),
    );

    // Filter available tables
    const availableTables = allTables.filter(
      (table) => !reservedTableIds.has(table.id),
    );

    // Find table combinations that can accommodate the party size
    const combinations = findTableCombinations(availableTables, partySize);

    return NextResponse.json({
      success: true,
      data: {
        totalAvailable: availableTables.length,
        availableTables: availableTables.map((t) => ({
          id: t.id,
          tableNumber: t.tableNumber,
          capacity: t.capacity,
          location: t.location,
        })),
        combinations: combinations.slice(0, 10), // Limit to 10 combinations
        requestedPartySize: partySize,
      },
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      {
        error: "Failed to check availability",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Helper function to find table combinations
function findTableCombinations(tables: any[], partySize: number) {
  const combinations: any[] = [];

  // Sort tables by capacity
  const sortedTables = [...tables].sort((a, b) => a.capacity - b.capacity);

  // Find single table that can accommodate the party
  const singleTables = sortedTables.filter((t) => t.capacity >= partySize);
  singleTables.forEach((table) => {
    combinations.push({
      tables: [table],
      numberOfTables: 1,
      totalCapacity: table.capacity,
      canAccommodate: true,
    });
  });

  // Find combinations of 2 tables
  for (let i = 0; i < sortedTables.length; i++) {
    for (let j = i + 1; j < sortedTables.length; j++) {
      const totalCapacity = sortedTables[i].capacity + sortedTables[j].capacity;
      if (totalCapacity >= partySize) {
        combinations.push({
          tables: [sortedTables[i], sortedTables[j]],
          numberOfTables: 2,
          totalCapacity,
          canAccommodate: true,
        });
      }
    }
  }

  // Find combinations of 3 tables (if needed)
  if (combinations.length < 5) {
    for (let i = 0; i < sortedTables.length; i++) {
      for (let j = i + 1; j < sortedTables.length; j++) {
        for (let k = j + 1; k < sortedTables.length; k++) {
          const totalCapacity =
            sortedTables[i].capacity +
            sortedTables[j].capacity +
            sortedTables[k].capacity;
          if (totalCapacity >= partySize) {
            combinations.push({
              tables: [sortedTables[i], sortedTables[j], sortedTables[k]],
              numberOfTables: 3,
              totalCapacity,
              canAccommodate: true,
            });
          }
        }
      }
    }
  }

  // Sort by number of tables (prefer fewer tables) and then by total capacity
  return combinations.sort((a, b) => {
    if (a.numberOfTables !== b.numberOfTables) {
      return a.numberOfTables - b.numberOfTables;
    }
    return a.totalCapacity - b.totalCapacity;
  });
}
