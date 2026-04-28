import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateVerificationToken } from "@/lib/token-service";
import { sendVerificationEmail } from "@/lib/email-service";

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

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, message: "Email is already verified. Please login." },
        { status: 400 },
      );
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken(user.id, user.email);

    // Send verification email
    await sendVerificationEmail(
      user.email,
      verificationToken,
      user.name || "User",
    );

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send verification email" },
      { status: 500 },
    );
  }
}
