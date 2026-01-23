// app/api/addresses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();
    const { id } = await params;

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

    const address = await db.address.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "Address not found",
          address: null,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Address retrieved successfully",
      address,
    });
  } catch (error: any) {
    console.error("Get address error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve address",
        address: null,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// app/api/addresses/[id]/route.ts (PUT method)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { street, city, state, postalCode, country, isDefault } = body;

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

    // Check if address exists and belongs to user
    const existingAddress = await db.address.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Address not found",
          address: null,
        },
        { status: 404 },
      );
    }

    const updatedAddress = await db.$transaction(async (tx) => {
      // If setting as default, update all other addresses to not default
      if (isDefault === true) {
        await tx.address.updateMany({
          where: {
            userId: user.id,
            id: { not: id },
          },
          data: { isDefault: false },
        });
      }

      // Update the address
      const address = await tx.address.update({
        where: { id: id },
        data: {
          street,
          city,
          state,
          postalCode,
          country,
          isDefault,
        },
      });

      return address;
    });

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error: any) {
    console.error("Update address error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          message: "Address not found",
          address: null,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update address",
        address: null,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// app/api/addresses/[id]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Add logging
    console.log(`DELETE address request for ID: ${id}`);

    const user = await getUser();

    if (!user?.id) {
      console.log("No user found");
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    console.log(`User ID: ${user.id}`);

    const address = await db.address.findFirst({
      where: {
        id: id,
        userId: user.id,
        isArchived: false,
      },
    });

    console.log(`Address found: ${!!address}`);

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 },
      );
    }

    await db.$transaction(async (tx) => {
      // Soft delete
      await tx.address.delete({
        where: { id: address.id },
      });
    });

    console.log("Address deleted successfully");

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete address error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete address",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
