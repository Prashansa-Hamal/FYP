import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";

// GET /api/tables - Get all tables
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const isAvailable = searchParams.get("isAvailable");
    const location = searchParams.get("location");

    // Build where clause
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (isAvailable !== null) {
      whereClause.isAvailable = isAvailable === "true";
    }

    if (location) {
      whereClause.location = location;
    }

    const tables = await db.table.findMany({
      where: whereClause,
      orderBy: {
        tableNumber: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: tables,
      count: tables.length,
    });
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch tables",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST /api/tables - Create a new table
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    // Check if user is admin
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { tableNumber, capacity, location, status } = body;

    // Validate required fields
    if (!tableNumber || !capacity) {
      return NextResponse.json(
        { error: "Table number and capacity are required" },
        { status: 400 },
      );
    }

    // Check if table number already exists
    const existingTable = await db.table.findUnique({
      where: { tableNumber },
    });

    if (existingTable) {
      return NextResponse.json(
        { error: "Table number already exists" },
        { status: 409 },
      );
    }

    const table = await db.table.create({
      data: {
        tableNumber,
        capacity,
        location: location || null,
        status: status || "AVAILABLE",
        isAvailable: status === "AVAILABLE",
      },
    });

    return NextResponse.json({
      success: true,
      data: table,
      message: "Table created successfully",
    });
  } catch (error) {
    console.error("Error creating table:", error);
    return NextResponse.json(
      {
        error: "Failed to create table",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
