import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";

// GET /api/tables/stats - Get table statistics
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    // Check if user is admin or staff
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin or Manager access required." },
        { status: 401 },
      );
    }

    const allTables = await db.table.findMany();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's reservations
    const todaysReservations = await db.reservation.findMany({
      where: {
        reservationDate: {
          gte: today,
          lt: tomorrow,
        },
        status: "CONFIRMED",
      },
      include: {
        tables: true,
      },
    });

    // Calculate statistics
    const totalTables = allTables.length;
    const availableTables = allTables.filter(
      (t) => t.status === "AVAILABLE",
    ).length;
    const occupiedTables = allTables.filter(
      (t) => t.status === "OCCUPIED",
    ).length;
    const reservedTables = allTables.filter(
      (t) => t.status === "RESERVED",
    ).length;
    const outOfServiceTables = allTables.filter(
      (t) => t.status === "OUT_OF_SERVICE",
    ).length;

    // Calculate capacity statistics
    const totalCapacity = allTables.reduce((sum, t) => sum + t.capacity, 0);
    const availableCapacity = allTables
      .filter((t) => t.status === "AVAILABLE")
      .reduce((sum, t) => sum + t.capacity, 0);

    // Get tables by location
    const tablesByLocation = allTables.reduce(
      (acc, table) => {
        const location = table.location || "General";
        if (!acc[location]) {
          acc[location] = [];
        }
        acc[location].push(table);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalTables,
          availableTables,
          occupiedTables,
          reservedTables,
          outOfServiceTables,
          utilizationRate:
            ((occupiedTables + reservedTables) / totalTables) * 100,
        },
        capacity: {
          totalCapacity,
          availableCapacity,
          averageCapacity: totalCapacity / totalTables,
        },
        tablesByLocation,
        todaysReservations: todaysReservations.length,
      },
    });
  } catch (error) {
    console.error("Error fetching table statistics:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
