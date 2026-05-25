// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET!;
// const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

// export interface TokenPayload {
//   userId: string;
//   email: string;
//   type: "email_verification" | "password_reset";
// }

// export function generateVerificationToken(
//   userId: string,
//   email: string,
// ): string {
//   const payload: TokenPayload = {
//     userId,
//     email,
//     type: "email_verification",
//   };

//   return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
// }

// export function generatePasswordResetToken(
//   userId: string,
//   email: string,
// ): string {
//   const payload: TokenPayload = {
//     userId,
//     email,
//     type: "password_reset",
//   };

//   return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
// }

// export function verifyToken(token: string): TokenPayload | null {
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
//     return decoded;
//   } catch (error) {
//     return null;
//   }
// }

/**
 * Token service for JWT-based authentication and verification
 * Handles email verification and password reset tokens
 */
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  userId: string;
  email: string;
  type: "email_verification" | "password_reset";
}

/**
 * Generate a JWT token for email verification
 * @param userId - User's unique identifier
 * @param email - User's email address
 * @returns JWT token valid for 24 hours
 */
export function generateVerificationToken(
  userId: string,
  email: string,
): string {
  const payload: TokenPayload = {
    userId,
    email,
    type: "email_verification",
  };

  console.log("Generating verification token for:", { userId, email });
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  console.log("Token generated successfully");
  return token;
}

/**
 * Generate a JWT token for password reset
 * @param userId - User's unique identifier
 * @param email - User's email address
 * @returns JWT token valid for 1 hour
 */
export function generatePasswordResetToken(
  userId: string,
  email: string,
): string {
  const payload: TokenPayload = {
    userId,
    email,
    type: "password_reset",
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
