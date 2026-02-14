import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isAvailable } = body;

    // Validate ID
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "Table ID is required" },
        { status: 400 },
      );
    }

    // Validate isAvailable
    if (typeof isAvailable !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isAvailable must be boolean" },
        { status: 400 },
      );
    }

    // Check if table exists
    const existingTable = await db.table.findUnique({
      where: { id },
    });

    if (!existingTable) {
      return NextResponse.json(
        { success: false, message: "Table not found" },
        { status: 404 },
      );
    }

    if (existingTable.isAvailable === isAvailable) {
      return NextResponse.json(
        {
          success: false,
          message: `Table is already ${isAvailable ? "available" : "occupied"}`,
        },
        { status: 400 },
      );
    }

    // Update table
    const updatedTable = await db.table.update({
      where: { id },
      data: { isAvailable },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Table ${updatedTable.tableNumber} is now ${isAvailable ? "marked vacant" : "marked seated"}`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating table availability:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
