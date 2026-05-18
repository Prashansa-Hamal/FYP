import { z } from "zod";

// Password validation with strength requirements
const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" });

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .min(1, { message: "Password is required" }), // Login doesn't need strength check
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters" })
    .max(50, { message: "Full name must not exceed 50 characters" }),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .transform((val) => val.toLowerCase()),
  password: passwordSchema, // Signup requires strong password
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
    { message: "Category is required" },
  ),
  preparationStation: z.enum(
    ["KITCHEN", "BAR", "DESSERT_STATION", "FRY_STATION", "GRILL_STATION"],
    { message: "Preparation station is required" },
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

export const addressSchema = z.object({
  name: z.string().min(3, "Name is required"),
  phone: z.string().min(10, "Phone Number is required"),
  street: z.string().min(3, "Street is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z
    .string()
    .min(1, { message: "Postal code is required" })
    .max(20, { message: "Postal code is too long" })
    .regex(/^[A-Za-z0-9\s\-]+$/, { message: "Invalid postal code format" }),
  country: z.string().min(2, "Country is required"), // ✅ REQUIRED
  isDefault: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const tableSchema = z.object({
  tableNumber: z
    .number({ message: "Table number must be a number" })
    .int()
    .min(1, "Table number is required"),
  capacity: z
    .number({ message: "Capacity must be a number" })
    .int()
    .min(1, "Capacity must be at least 1"),

  isAvailable: z.boolean().optional(),

  location: z.string().optional(),
});

export type TableFormValues = z.infer<typeof tableSchema>;

export const createReservationSchema = z.object({
  reservationDate: z.string().min(1, "Reservation date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  partySize: z
    .number()
    .min(1, "Party size must be at least 1")
    .max(20, "Party size cannot exceed 20"),
  specialRequests: z.string().optional(),
});

export const updateReservationSchema = z.object({
  reservationDate: z.string().optional(),
  timeSlot: z.string().optional(),
  partySize: z.number().min(1).max(20).optional(),
  specialRequests: z.string().optional(),
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
});

export const checkAvailabilitySchema = z.object({
  date: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  partySize: z.number().min(1, "Party size is required"),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type CheckAvailabilityInput = z.infer<typeof checkAvailabilitySchema>;
