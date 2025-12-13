const CURRENCY_FORMATTER = new Intl.NumberFormat("en-AU", {
  currency: "AUD",
  style: "currency",
  minimumFractionDigits: 2,
});

export const formatCurrency = (amount: number) => {
  return CURRENCY_FORMATTER.format(amount);
};

const NUMBER_FORMATTER = new Intl.NumberFormat("en-NP");

export const formatNumber = (number: number) => {
  return NUMBER_FORMATTER.format(number);
};

// Weight formatter (metric system - grams/kilograms)
const WEIGHT_FORMATTER = new Intl.NumberFormat("en-AU", {
  style: "unit",
  unit: "gram",
  unitDisplay: "short",
});

export const formatWeight = (grams: number) => {
  if (grams >= 1000) {
    return `${NUMBER_FORMATTER.format(grams / 1000)}kg`;
  }
  return `${WEIGHT_FORMATTER.format(grams)}`;
};

// Time formatter (hours/minutes)
export const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (minutes >= 60) {
    return `${hours}h ${remainingMinutes} min`;
  }
  return `${remainingMinutes}min`;
};

// Diameter formatter (millimetres to centimetres)
const DIAMETER_FORMATTER = new Intl.NumberFormat("en-AU", {
  style: "unit",
  unit: "millimeter",
  unitDisplay: "short",
});

export const formatDiameter = (millimeter: number) => {
  const cm = Math.floor(millimeter / 10);
  const mm = millimeter % 10;

  if (millimeter >= 10) {
    if (mm == 0) {
      return `${cm}cm`;
    }
    return `${cm}cm ${mm}mm`;
  }

  return `${DIAMETER_FORMATTER.format(millimeter)}`;
};
