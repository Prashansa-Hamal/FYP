"use server";

import { getOAuthClient, OAuthProvider } from "@/cores/oAuth/base";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const oAuthSignin = async (provder: OAuthProvider) => {
  const oAuthClient = getOAuthClient(provder);
  redirect(oAuthClient.createAuthUrl(await cookies()));
};