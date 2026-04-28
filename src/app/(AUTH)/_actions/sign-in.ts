// "use server";

// import { z } from "zod";
// import { loginSchema } from "@/schemas";
// import { getUserByEmail } from "@/data/user";
// import bcrypt, { compare } from "bcryptjs";
// import { createUserSession } from "@/cores/session";
// import { cookies } from "next/headers";

// export const logIn = async (values: z.infer<typeof loginSchema>) => {
//   // Validate the input fields using the RegisterSchema
//   const validatedFields = loginSchema.safeParse(values);

//   // If validation fails, return an error
//   if (!validatedFields.success) {
//     return { error: "Invalid fields!" };
//   }

//   // Destructure the validated data
//   const { email, password } = validatedFields.data;

//   const user = await getUserByEmail(email);

//   if (user == null) return { error: "User not found!" };

//   if (!user.password)
//     return { error: "No password found with the associated user." };

//   const isCorrectPassword = await compare(password, user.password);

//   if (!isCorrectPassword) return { error: "Invalid password!" };

//   await createUserSession(user, await cookies());

//   return { success: "Login Succesful" };
// };

"use server";

import { z } from "zod";
import { loginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { compare } from "bcryptjs";
import { createUserSession } from "@/cores/session";
import { cookies } from "next/headers";
import { generateVerificationToken } from "@/lib/token-service";
import { sendVerificationEmail } from "@/lib/email-service";

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

  // Check if email is verified
  if (!user.emailVerified) {
    // Generate new verification token
    const verificationToken = generateVerificationToken(user.id, user.email);

    // Send verification email
    try {
      await sendVerificationEmail(
        user.email,
        verificationToken,
        user.name || "User",
      );

      return {
        error:
          "Please verify your email address before logging in. A new verification link has been sent to your email.",
        needsVerification: true,
      };
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return {
        error:
          "Your email is not verified. Please contact support to receive a verification link.",
      };
    }
  }

  // User is verified, create session
  await createUserSession(user, await cookies());

  return { success: "Login Successful" };
};
