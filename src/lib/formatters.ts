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
