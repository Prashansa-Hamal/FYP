import { format } from "date-fns";

// Currency formatter for Nepali Rupees
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  minimumFractionDigits: 2,
});

/**
 * Format a number as Nepali Rupees currency
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number) => {
  return CURRENCY_FORMATTER.format(amount);
};

// Number formatter for Nepali locale
const NUMBER_FORMATTER = new Intl.NumberFormat("en-NP");

/**
 * Format a number with Nepali locale formatting
 * @param number - The number to format
 * @returns Formatted number string
 */
export const formatNumber = (number: number) => {
  return NUMBER_FORMATTER.format(number);
};

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "January 1, 2024 at 12:00 PM")
 */
export const formatDate = (dateString: string) => {
  return format(new Date(dateString), "PPpp");
};

/**
 * Converts price from cents/paisa to rupees
 * (Use if you store prices in cents)
 */
export const formatPriceFromCents = (priceInCents: number): number => {
  return priceInCents / 100;
};

/**
 * Converts price to cents/paisa for storage
 */
export const formatPriceToCents = (price: number): number => {
  return Math.round(price * 100);
};
