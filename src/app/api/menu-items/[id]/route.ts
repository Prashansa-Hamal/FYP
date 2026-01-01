// File: /app/api/menu-items/[id]/route.ts
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const menuItem = await db.menuItem.findUnique({
      where: { id },
    });

    if (!menuItem) {
      return NextResponse.json(
        { success: false, message: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error("GET /api/menu-items/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch menu item" },
      { status: 500 }
    );
  }
}

// PUT - Update item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const menuItem = await db.menuItem.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price ? parseFloat(body.price) : undefined,
        category: body.category,
        preparationStation: body.preparationStation,
        isAvailable: body.isAvailable,
        isVegetarian: body.isVegetarian,
        isSpicy: body.isSpicy,
        isAlcoholic: body.isAlcoholic,
        preparationTime: body.preparationTime
          ? parseInt(body.preparationTime)
          : undefined,
        imageUrl: body.imageUrl,
        calories: body.calories ? parseInt(body.calories) : null,
        ingredients: body.ingredients,
        tags: body.tags,
      },
    });

    return NextResponse.json({
      success: true,
      data: menuItem,
      message: "Menu item updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/menu-items/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update menu item" },
      { status: 500 }
    );
  }
}
