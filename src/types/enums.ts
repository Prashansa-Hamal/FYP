export const USER_ROLES = [
  "USER",
  "ADMIN",
  "CHEF",
  "BARTENDER",
  "WAITER",
  "MANAGER",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

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

export const PAYMENT_STATUS = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

export const PAYMENT_METHODS = ["CASH", "CARD", "ONLINE", "WALLET"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ORDER_TYPES = ["DINE_IN", "TAKEAWAY", "DELIVERY"] as const;

export type OrderType = (typeof ORDER_TYPES)[number];

export const ITEM_CATEGORIES = [
  "APPETIZER",
  "MAIN_COURSE",
  "DESSERT",
  "BEVERAGE",
  "ALCOHOLIC",
  "SNACK",
  "SIDE_DISH",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const PREPARATION_STATIONS = [
  "KITCHEN",
  "BAR",
  "DESSERT_STATION",
  "FRY_STATION",
  "GRILL_STATION",
] as const;

export type PreparationStation = (typeof PREPARATION_STATIONS)[number];
