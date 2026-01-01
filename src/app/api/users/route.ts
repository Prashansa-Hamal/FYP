import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Build filter object
    const where: any = {};

    const search = searchParams.get("search");
    const role = searchParams.get("role");

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    // Handle role filter - support multiple roles comma-separated
    if (role) {
      // Split by comma and filter out empty strings
      const roles = role.split(",").filter(Boolean);

      if (roles.length === 1) {
        // Single role
        where.role = roles[0];
      } else if (roles.length > 1) {
        // Multiple roles - use "in" operator
        where.role = { in: roles };
      }
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Execute query
    const [users, total] = await Promise.all([
      db.user.findMany({
        // ✅ Use lowercase 'user' for Prisma client
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        // Optionally include related data
        include: {
          addresses: true,
          orders: {
            take: 5,
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    // Remove password from response for security
    const safeUsers = users.map(({ password, ...rest }) => rest);

    return NextResponse.json({
      success: true,
      data: safeUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
