import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ItemCategory, PreparationStation } from "@/types/enums";
import { getUser } from "@/data/user";

// GET - Fetch all menu items (PUBLIC - no auth required)
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

    // Handle category filter - support multiple categories comma-separated
    if (category) {
      // Split by comma and filter out empty strings
      const categories = category.split(",").filter(Boolean);

      if (categories.length === 1) {
        // Single category
        where.category = categories[0];
      } else if (categories.length > 1) {
        // Multiple categories - use "in" operator
        where.category = { in: categories };
      }
    }

    // Handle station filter - support multiple stations comma-separated
    if (station) {
      // Split by comma and filter out empty strings
      const stations = station.split(",").filter(Boolean);

      if (stations.length === 1) {
        // Single station
        where.preparationStation = stations[0];
      } else if (stations.length > 1) {
        // Multiple stations - use "in" operator
        where.preparationStation = { in: stations };
      }
    }

    // Handle boolean filters
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
      { status: 500 },
    );
  }
}

// POST - Create menu item (ADMIN/MANAGER ONLY)
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Check authentication
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    // SECURITY: Only ADMIN and MANAGER can create menu items
    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized. Only administrators can create menu items." 
        },
        { status: 403 },
      );
    }

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
        { status: 400 },
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

    // Audit log
    console.log(`[MENU AUDIT] Menu item '${menuItem.name}' created by ${user.role} user ${user.id}`);

    return NextResponse.json({
      success: true,
      data: menuItem,
      message: "Menu item created successfully",
    });
  } catch (error) {
    console.error("POST /api/menu-items error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create menu item" },
      { status: 500 },
    );
  }
}

// DELETE - Delete item (ADMIN ONLY)
export async function DELETE(request: NextRequest) {
  try {
    // SECURITY: Check authentication
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    // SECURITY: Only ADMIN can delete menu items
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized. Only administrators can delete menu items." 
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const deletedItem = await db.menuItem.delete({
      where: { id: body.id },
    });

    // Audit log
    console.log(`[MENU AUDIT] Menu item '${deletedItem.name}' deleted by admin user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/menu-items/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete menu item" },
      { status: 500 },
    );
  }
}

// PUT - Toggle Menu Item Availability (ADMIN/MANAGER ONLY)
export async function PUT(request: NextRequest) {
  try {
    // SECURITY: Check authentication
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    // SECURITY: Only ADMIN and MANAGER can update availability
    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized. Only administrators can update menu items." 
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const { id, isAvailable } = body;

    if (!id || typeof isAvailable !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 },
      );
    }

    const menuItem = await db.menuItem.update({
      where: { id },
      data: { isAvailable },
    });

    // Audit log
    console.log(`[MENU AUDIT] Menu item '${menuItem.name}' availability set to ${isAvailable} by ${user.role} user ${user.id}`);

    return NextResponse.json({
      success: true,
      data: menuItem,
      message: "Availability updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/menu-items error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update availability" },
      { status: 500 },
    );
  }
}
