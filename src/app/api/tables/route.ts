import db from "@/lib/db";
import { tableSchema } from "@/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // ----------------------------
    // Pagination
    // ----------------------------
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);
    const skip = (page - 1) * limit;

    // ----------------------------
    // Sorting
    // ----------------------------
    const sortBy = searchParams.get("sortBy") ?? "tableNumber";
    const sortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc";

    // ----------------------------
    // Filters
    // ----------------------------
    const where: any = {};

    const isAvailable = searchParams.get("isAvailable");
    if (isAvailable !== null) {
      where.isAvailable = isAvailable === "true";
    }

    const location = searchParams.get("location");
    if (location) {
      where.location = location;
    }

    // ----------------------------
    // Queries
    // ----------------------------
    const [tables, total] = await Promise.all([
      db.table.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
        select: {
          id: true,
          tableNumber: true,
          capacity: true,
          isAvailable: true,
          location: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              reservations: true,
            },
          },
        },
      }),
      db.table.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: tables,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

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

    const table = await db.table.create({
      data: parsed.data,
    });

    return NextResponse.json(table);
  } catch (error) {
    return NextResponse.json(
      { error: "Table number must be unique" },
      { status: 500 },
    );
  }
}
