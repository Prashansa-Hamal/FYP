import db from "@/lib/db";
import { tableSchema } from "@/schemas";
import { NextRequest, NextResponse } from "next/server";

// ================= GET =================
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const table = await db.table.findUnique({
      where: { id },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json(table);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch table" },
      { status: 500 },
    );
  }
}

// ================= PUT =================
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const body = await request.json();

    const parsed = tableSchema.safeParse({
      ...body,
      tableNumber: Number(body.tableNumber),
      capacity: Number(body.capacity),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const table = await db.table.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(table);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update table" },
      { status: 500 },
    );
  }
}

// ================= DELETE =================
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const existingTable = await db.table.findUnique({
      where: { id },
      include: {
        reservations: true,
      },
    });

    if (!existingTable) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    if (existingTable.reservations.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete table with existing reservations" },
        { status: 400 },
      );
    }

    await db.table.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Table deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete table" },
      { status: 500 },
    );
  }
}
