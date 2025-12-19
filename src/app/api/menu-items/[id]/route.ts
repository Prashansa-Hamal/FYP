// File: /app/api/menu-items/[id]/route.ts
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET single item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const menuItem = await db.menuItem.findUnique({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const menuItem = await db.menuItem.update({
      where: { id: params.id },
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
