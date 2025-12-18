import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const signupSchema = loginSchema.extend({
  name: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters" }),
});

export const menuItemFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, { message: "Menu description is required" }),
  price: z.number().int().min(1, "Price is required"),
  category: z.enum(
    [
      "APPETIZER",
      "MAIN_COURSE",
      "DESSERT",
      "BEVERAGE",
      "ALCOHOLIC",
      "SNACK",
      "SIDE_DISH",
    ],
    { message: "Category is required" }
  ),
  preparationStation: z.enum(
    ["KITCHEN", "BAR", "DESSERT_STATION", "FRY_STATION", "GRILL_STATION"],
    { message: "Preparation station is required" }
  ),
  isVegetarian: z.boolean(),
  isSpicy: z.boolean(),
  isAlcoholic: z.boolean(),
  preparationTime: z.number().int().min(1, "Preparation time is required"),
  calories: z.number().int().min(1, "Calories is required"),
  ingredients: z
    .array(z.string())
    .min(1, "At least one ingredient is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  imageUrl: z.string(),
});
