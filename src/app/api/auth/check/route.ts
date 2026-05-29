import { getUser } from "@/data/user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();
    console.log("Fetched user in API route:", user);

    return NextResponse.json({
      isAuthenticated: !!user,
      user: user || null,
    });
  } catch (error) {
    return NextResponse.json({
      isAuthenticated: false,
      user: null,
    });
  }
}
