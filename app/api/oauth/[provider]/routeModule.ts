import { NextRequest } from "next/server";
import { z } from "zod";
import {
  getOAuthClient,
  OAuthClient,
  OAuthProvider,
  OAuthProviders,
} from "@/cores/oAuth/base";
import { redirect } from "next/navigation";
import { getUserByEmail } from "@/data/user";
import db from "@/lib/db";
import { createUserSession } from "@/cores/session";
import { cookies } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: rawProvider } = await params;
  const code = req.nextUrl.searchParams.get("code");

  const state = req.nextUrl.searchParams.get("state");

  const provider = z.enum(OAuthProviders).safeParse(rawProvider);

  if (
    !provider.success ||
    typeof code !== "string" ||
    typeof state !== "string"
  ) {
    return redirect(
      `/login?oauthError=${encodeURIComponent(
        `Failed to connect. Please try again.`
      )}`
    );
  }

  const oAuthClient = await getOAuthClient(provider.data);

  try {
    const oAuthUser = await oAuthClient.fetchUser(code, state, await cookies());

    const user = await connectUserToAccount(oAuthUser, provider.data);

    await createUserSession(user, await cookies());
  } catch (err) {
    return redirect(
      `/login?oauthError=${encodeURIComponent(
        `${
          provider.data.charAt(0).toUpperCase() + provider.data.slice(1)
        } Login failed!`
      )}`
    );
  }

  redirect("/");
}

const connectUserToAccount = async (
  { id, name, email }: { id: string; name: string; email: string },
  provider: OAuthProvider
) => {
  const existingUser = await getUserByEmail(email);
  if (existingUser == null) {
    const newUser = await db.user.create({
      data: {
        name,
        email,
        accounts: {
          create: {
            provider,
            providerAccountId: id,
          },
        },
      },
    });
    return newUser;
  }

  const existingAccount = await db.account.findFirst({
    where: {
      provider,
      providerAccountId: id,
      userId: existingUser.id,
    },
  });

  if (!existingAccount) {
    await db.account.create({
      data: {
        provider,
        providerAccountId: id,
        userId: existingUser.id,
      },
    });
  }

  return existingUser;
};