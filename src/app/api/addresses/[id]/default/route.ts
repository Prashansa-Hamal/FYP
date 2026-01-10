// app/api/addresses/[id]/default/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
          address: null,
        },
        { status: 401 }
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
        { status: 404 }
      );
    }

    const updatedAddress = await db.$transaction(async (tx) => {
      // Set all addresses to not default
      await tx.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });

      // Set this address as default
      const address = await tx.address.update({
        where: { id: id },
        data: { isDefault: true },
      });

      return address;
    });

    return NextResponse.json({
      success: true,
      message: "Address set as default successfully",
      address: updatedAddress,
    });
  } catch (error: any) {
    console.error("Set default address error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          message: "Address not found",
          address: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to set address as default",
        address: null,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
