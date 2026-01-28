import { DEFAULT_EXCHANGE_RATE_USD_UYU } from "./constants.js";
import type { Currency } from "./types.js";

export function convertPrice(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRate: number = DEFAULT_EXCHANGE_RATE_USD_UYU
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  if (fromCurrency === "USD" && toCurrency === "UYU") {
    return amount * exchangeRate;
  }

  if (fromCurrency === "UYU" && toCurrency === "USD") {
    return amount / exchangeRate;
  }

  // For other currencies, return original amount
  return amount;
}

export function formatPrice(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat(
    currency === "USD" ? "en-US" : "es-UY",
    {
      style: "currency",
      currency: currency === "USD" ? "USD" : "UYU",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );

  return formatter.format(amount);
}
