import db from "@/lib/db";
import { tableSchema } from "@/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const table = await db.table.findUnique({
      where: { id: id },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
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
      where: { id: id },
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check if table exists
    const existingTable = await db.table.findUnique({
      where: { id: id },
      include: {
        reservations: true,
      },
    });

    if (!existingTable) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Prevent deletion if table has reservations
    if (existingTable.reservations.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete table with existing reservations" },
        { status: 400 },
      );
    }

    await db.table.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Table deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete table" },
      { status: 500 },
    );
  }
}
