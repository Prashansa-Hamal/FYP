import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/token-service";
import { sendPasswordResetEmail } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    console.log("user", user);

    // For security, don't reveal if email exists or not
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email doesn't exist.",
        },
        { status: 400 },
      );
    }

    // Generate password reset token
    const token = generatePasswordResetToken(user.id, user.email);

    // Send email
    await sendPasswordResetEmail(user.email, token, user.name || "User");

    return NextResponse.json({
      success: true,
      message: "Verification link has been sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process request" },
      { status: 500 },
    );
  }
}
