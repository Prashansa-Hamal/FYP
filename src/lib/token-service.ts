import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  userId: string;
  email: string;
  type: "email_verification" | "password_reset";
}

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

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.log("Token verification failed:", error);
    return null;
  }
}
