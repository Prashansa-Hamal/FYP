"use server";

import db from "@/lib/db";
import { getCurrentUser } from "@/data/current-user";
import { cookies } from "next/headers";
import { updateUserSessionData } from "@/cores/session";

export const toggleUserRole = async () => {
  const user = await getCurrentUser({ redirectIfNotFound: true });

  const newRole = user?.role === "ADMIN" ? "USER" : "ADMIN";

  const updatedUser = await db.user.update({
    where: { id: user?.id },
    data: {
      role: newRole,
    },
  });

  await updateUserSessionData(updatedUser, await cookies());

  return { success: `User role Updated to ${newRole}` };
};