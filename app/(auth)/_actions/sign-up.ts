"use server";

import { z } from "zod";
import { signupSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/data/user";
import db from "@/lib/db";

export const signUp = async (values: z.infer<typeof signupSchema>) => {
  // Validate the input fields using the RegisterSchema
  const validatedFields = signupSchema.safeParse(values);

  // If validation fails, return an error
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  // Destructure the validated data
  const { email, password, name } = validatedFields.data;

  // Check if a user already exists with the given email
  const existingUser = await getUserByEmail(email);

  // If the email is already registered, return an error
  if (existingUser) return { error: "Email already in use!" };

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user record in the database
  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  if (user == null) return { error: "Unable to create account!" };

  // await createUserSession(user, await cookies());

  // Generate a verification token for email confirmation
  //   const verificationToken = await generateVerificationToken(email);

  // Send the verification email to the user's email address
  //   await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: "Confirmation email sent!" };
};