"use server";

import { z } from "zod";
import { loginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import bcrypt, { compare } from "bcryptjs";
import { createUserSession } from "@/cores/session";
import { cookies } from "next/headers";

export const logIn = async (values: z.infer<typeof loginSchema>) => {
  // Validate the input fields using the RegisterSchema
  const validatedFields = loginSchema.safeParse(values);

  // If validation fails, return an error
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  // Destructure the validated data
  const { email, password } = validatedFields.data;

  const user = await getUserByEmail(email);

  if (user == null) return { error: "User not found!" };

  if (!user.password)
    return { error: "No password found with the associated user." };

  const isCorrectPassword = await compare(password, user.password);

  if (!isCorrectPassword) return { error: "Invalid password!" };

  await createUserSession(user, await cookies());

  return { success: "Login Succesful" };
};