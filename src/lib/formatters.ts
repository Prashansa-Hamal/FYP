import { format } from "date-fns";

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  minimumFractionDigits: 2,
});

export const formatCurrency = (amount: number) => {
  return CURRENCY_FORMATTER.format(amount);
};

const NUMBER_FORMATTER = new Intl.NumberFormat("en-NP");

export const formatNumber = (number: number) => {
  return NUMBER_FORMATTER.format(number);
};

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
