"use server";

import { User } from "@/app/generated/prisma/client";
import { getUserFromSession } from "@/cores/session";

import db from "@/lib/db";
import { cookies } from "next/headers";
import { cache } from "react";

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    return user ? user : null;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
    });
    return user ? user : null;
  } catch {
    return null;
  }
};

export const getUser = cache(async () => {
  return await getUserFromSession(await cookies());
});

export const getFullUser = async (): Promise<User | null> => {
  const session = await getUser();
  if (!session?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.id },
  });

  return user ? user : null;
};