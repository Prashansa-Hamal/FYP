// app/api/addresses/route.ts
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/data/user";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
          addresses: [],
        },
        { status: 401 },
      );
    }

    const addresses = await db.address.findMany({
      where: {
        userId: user.id,
        // OR: [{ isArchived: false }, { isArchived: null! }],
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      message: "Addresses retrieved successfully",
      addresses,
    });
  } catch (error: any) {
    console.error("Get addresses error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve addresses",
        addresses: [],
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// app/api/addresses/route.ts (POST method)
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
          address: null,
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      street,
      city,
      state,
      postalCode,
      country = "US",
      isDefault = false,
    } = body;

    // Validation
    if (!street || !city || !state || !postalCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Street, city, state, and postal code are required",
          address: null,
        },
        { status: 400 },
      );
    }

    const address = await db.$transaction(async (tx) => {
      // 🔍 Check for existing identical address
      const existingAddress = await tx.address.findFirst({
        where: {
          userId: user.id,
          street,
          city,
          state,
          postalCode,
          country,
        },
      });

      if (existingAddress) {
        throw new Error("DUPLICATE_ADDRESS");
      }

      // If setting as default, unset previous defaults
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });
      }

      // Create new address
      return tx.address.create({
        data: {
          userId: user.id,
          street,
          city,
          state,
          postalCode,
          country,
          isDefault,
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Address created successfully",
        address,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Create address error:", error);

    // ✅ Duplicate address case
    if (error.message === "DUPLICATE_ADDRESS") {
      return NextResponse.json(
        {
          success: false,
          message: "This address already exists",
          address: null,
        },
        { status: 409 },
      );
    }

    // Prisma unique constraint fallback
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "Address already exists",
          address: null,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create address",
        address: null,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
