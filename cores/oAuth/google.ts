import { z } from "zod";
import { OAuthClient } from "./base";

export const createGoogleOAuthClient = () => {
  return new OAuthClient({
    provider: "google",
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    scopes: ["email", "profile"],
    urls: {
      auth: "https://accounts.google.com/o/oauth2/v2/auth",
      token: "https://oauth2.googleapis.com/token",
      user: "https://www.googleapis.com/oauth2/v2/userinfo",
    },
    userInfo: {
      schema: z.object({
        id: z.string(),
        email: z.string().email(),
        name: z.string().optional(),
        picture: z.string().optional(),
        given_name: z.string().optional(),
        family_name: z.string().optional(),
        verified_email: z.boolean().optional(),
      }),
      parcer: (user) => ({
        id: user.id,
        email: user.email,
        name:
          user.name ||
          `${user.given_name ?? ""} ${user.family_name ?? ""}`.trim(),
      }),
    },
  });
};