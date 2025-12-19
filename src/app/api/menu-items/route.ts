// File: /app/api/menu-items/route.ts
import { ItemCategory, PreparationStation } from "@/generated/prisma/enums";
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch all menu items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Build filter object
    const where: any = {};

    const category = searchParams.get("category");
    const station = searchParams.get("preparationStation");
    const isAvailable = searchParams.get("isAvailable");
    const isVegetarian = searchParams.get("isVegetarian");
    const isSpicy = searchParams.get("isSpicy");
    const search = searchParams.get("search");

    if (category) where.category = category;
    if (station) where.preparationStation = station;
    if (isAvailable !== null) where.isAvailable = isAvailable === "true";
    if (isVegetarian !== null) where.isVegetarian = isVegetarian === "true";
    if (isSpicy !== null) where.isSpicy = isSpicy === "true";

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Execute query
    const [items, total] = await Promise.all([
      db.menuItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.menuItem.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/menu-items error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

// POST - Create menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (
      !body.name ||
      !body.price ||
      !body.category ||
      !body.preparationStation
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const menuItem = await db.menuItem.create({
      data: {
        name: body.name,
        description: body.description || "",
        price: parseFloat(body.price),
        category: body.category as ItemCategory,
        preparationStation: body.preparationStation as PreparationStation,
        isAvailable: body.isAvailable ?? true,
        isVegetarian: body.isVegetarian ?? false,
        isSpicy: body.isSpicy ?? false,
        isAlcoholic: body.isAlcoholic ?? false,
        preparationTime: parseInt(body.preparationTime) || 15,
        imageUrl: body.imageUrl || null,
        calories: body.calories ? parseInt(body.calories) : null,
        ingredients: body.ingredients || [],
        tags: body.tags || [],
      },
    });

    return NextResponse.json({
      success: true,
      data: menuItem,
      message: "Menu item created successfully",
    });
  } catch (error) {
    console.error("POST /api/menu-items error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete item
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    await db.menuItem.delete({
      where: { id: body.id },
    });

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/menu-items/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}

// Toggle Menu Item Availability
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const { id, isAvailable } = body;

    if (!id || typeof isAvailable !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    }

    const menuItem = await db.menuItem.update({
      where: { id },
      data: { isAvailable },
    });

    return NextResponse.json({
      success: true,
      data: menuItem,
      message: "Availability updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/menu-items error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update availability" },
      { status: 500 }
    );
  }
}
