export type UserRole =
  | "USER"
  | "ADMIN"
  | "CHEF"
  | "BARTENDER"
  | "WAITER"
  | "MANAGER";

export const ORDER_STATUS = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "SERVED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export const PAYMENT_METHODS = ["CASH", "CARD", "ONLINE", "WALLET"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

export type ItemCategory =
  | "APPETIZER"
  | "MAIN_COURSE"
  | "DESSERT"
  | "BEVERAGE"
  | "ALCOHOLIC"
  | "SNACK"
  | "SIDE_DISH";

export type PreparationStation =
  | "KITCHEN"
  | "BAR"
  | "DESSERT_STATION"
  | "FRY_STATION"
  | "GRILL_STATION";
