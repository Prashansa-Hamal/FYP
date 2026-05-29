import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/data/user";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const upcoming = searchParams.get("upcoming") === "true";

    let where: any = { userId: user.id };

    if (status) where.status = status;

    if (upcoming) {
      where.reservationDate = { gte: new Date() };
      where.status = { not: "CANCELLED" };
    }

    const reservations = await db.reservation.findMany({
      where,
      include: {
        tables: true,
      },
      orderBy: {
        reservationDate: upcoming ? "asc" : "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: reservations,
      message: "Your reservations fetched successfully",
    });
  } catch (error) {
    console.log("GET /api/reservations/my-reservations error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch your reservations",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
