import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    console.log(
      "Verify email called with token:",
      token ? "Token present" : "No token",
    );

    if (!token) {
      console.log("No token provided");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?error=No verification token provided`,
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        type: string;
      };
      console.log("Token decoded successfully:", {
        userId: decoded.userId,
        type: decoded.type,
      });
    } catch (jwtError) {
      console.log("JWT verification failed:", jwtError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?error=Invalid or expired token`,
      );
    }

    // Check token type
    if (decoded.type !== "email_verification") {
      console.log("Invalid token type:", decoded.type);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?error=Invalid token type`,
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      console.log("User not found:", decoded.userId);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?error=User not found`,
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      console.log("Email already verified for user:", user.email);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?success=true&message=Email already verified`,
      );
    }

    // Update user's email verification status
    await db.user.update({
      where: { id: decoded.userId },
      data: { emailVerified: new Date() },
    });

    console.log("Email verified successfully for user:", user.email);

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?success=true`,
    );
  } catch (error) {
    console.log("Email verification error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?error=Verification failed. Please try again.`,
    );
  }
}
