import { z } from "zod";
import { redis } from "@/lib/redis";
import crypto from "crypto";

const roleValues = ["ADMIN", "USER"] as const;

const userSessionSchema = z.object({
  id: z.string(),
  role: z.enum(roleValues),
});

type UserSession = z.infer<typeof userSessionSchema>;

export type Cookies = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax";
      expires: number;
    }
  ) => void;
  get: (key: string) => { name: string; value: string } | undefined;
  delete: (key: string) => void;
};

const SESSION_EXPERATION_SECONDS = 60 * 60 * 24 * 7;
export const COOKIE_SESSION_KEY = "authToken";

export const createUserSession = async (
  user: UserSession,
  cookies: Cookies
) => {
  const sessionToken = crypto.randomBytes(512).toString("hex").normalize();

  await redis.set(
    `session:${sessionToken}`,
    userSessionSchema.safeParse(user).data,
    {
      ex: SESSION_EXPERATION_SECONDS,
    }
  );

  setCookie(sessionToken, cookies);
};

const setCookie = (sessionToken: string, cookies: Pick<Cookies, "set">) => {
  cookies.set(COOKIE_SESSION_KEY, sessionToken, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: Date.now() + SESSION_EXPERATION_SECONDS * 1000,
  });
};

export const getUserFromSession = async (cookies: Pick<Cookies, "get">) => {
  const sessionToken = cookies.get(COOKIE_SESSION_KEY)?.value;

  if (sessionToken == null) return null;

  return await getUserSessionById(sessionToken);
};

export const getUserSessionById = async (sessionToken: string) => {
  const session = await redis.get(`session:${sessionToken}`);

  if (!session) return null;

  const { success, data: user, error } = userSessionSchema.safeParse(session);

  return success ? user : null;
};

export const removeUserFromSession = async (
  cookies: Pick<Cookies, "get" | "delete">
) => {
  const sessionToken = cookies.get(COOKIE_SESSION_KEY)?.value;

  if (sessionToken == null) return null;

  await redis.del(`session:${sessionToken}`);

  cookies.delete(COOKIE_SESSION_KEY);
};

export const updateUserSessionData = async (
  user: UserSession,
  cookies: Pick<Cookies, "get">
) => {
  const sessionToken = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionToken == null) return null;

  await redis.set(
    `session:${sessionToken}`,
    userSessionSchema.safeParse(user).data,
    {
      ex: SESSION_EXPERATION_SECONDS,
    }
  );
};

export const updateUserSessionExpiration = async (
  cookies: Pick<Cookies, "get" | "set">
) => {
  const sessionToken = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionToken == null) return null;

  const user = await getUserSessionById(sessionToken);
  if (user == null) return;

  await redis.set(`session:${sessionToken}`, user, {
    ex: SESSION_EXPERATION_SECONDS,
  });

  setCookie(sessionToken, cookies);
};