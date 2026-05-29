import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";

// GET /api/tables/[id] - Get a single table
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const table = await db.table.findUnique({
      where: { id },
      include: {
        reservations: {
          where: {
            reservationDate: {
              gte: new Date(),
            },
            status: "CONFIRMED",
          },
          orderBy: {
            reservationDate: "asc",
          },
          take: 10,
        },
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: table,
    });
  } catch (error) {
    console.log("Error fetching table:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch table",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// PUT /api/tables/[id] - Update a table
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getUser();

    // Check if user is admin
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { tableNumber, capacity, location, status, isAvailable } = body;

    // Check if table exists
    const existingTable = await db.table.findUnique({
      where: { id },
    });

    if (!existingTable) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Check if new table number conflicts with another table
    if (tableNumber && tableNumber !== existingTable.tableNumber) {
      const conflictTable = await db.table.findUnique({
        where: { tableNumber },
      });

      if (conflictTable) {
        return NextResponse.json(
          { error: "Table number already exists" },
          { status: 409 },
        );
      }
    }

    const table = await db.table.update({
      where: { id },
      data: {
        tableNumber: tableNumber !== undefined ? tableNumber : undefined,
        capacity: capacity !== undefined ? capacity : undefined,
        location: location !== undefined ? location : undefined,
        status: status !== undefined ? status : undefined,
        isAvailable:
          isAvailable !== undefined ? isAvailable : status === "AVAILABLE",
      },
    });

    return NextResponse.json({
      success: true,
      data: table,
      message: "Table updated successfully",
    });
  } catch (error) {
    console.log("Error updating table:", error);
    return NextResponse.json(
      {
        error: "Failed to update table",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/tables/[id] - Delete a table
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getUser();

    // Check if user is admin
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 },
      );
    }

    // Check if table exists
    const existingTable = await db.table.findUnique({
      where: { id },
      include: {
        reservations: {
          where: {
            reservationDate: {
              gte: new Date(),
            },
            status: "CONFIRMED",
          },
        },
      },
    });

    if (!existingTable) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Check if table has upcoming reservations
    if (existingTable.reservations.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete table with upcoming reservations" },
        { status: 400 },
      );
    }

    await db.table.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Table deleted successfully",
    });
  } catch (error) {
    console.log("Error deleting table:", error);
    return NextResponse.json(
      {
        error: "Failed to delete table",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
