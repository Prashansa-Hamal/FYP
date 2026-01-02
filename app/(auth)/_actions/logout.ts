"use server";

import { removeUserFromSession } from "@/cores/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const logOut = async () => {
  await removeUserFromSession(await cookies());
  redirect("/login");
};