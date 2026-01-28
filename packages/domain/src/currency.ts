import {
  convertPrice,
  formatPrice,
  DEFAULT_EXCHANGE_RATE_USD_UYU,
} from "@qregalo/shared";
import type { Product, Currency } from "@qregalo/shared";

export interface EstimatedPrice {
  amount: number;
  currency: Currency;
  formatted: string;
}

export function getEstimatedPrice(
  product: Product,
  targetCurrency: Currency = "USD",
  exchangeRate: number = DEFAULT_EXCHANGE_RATE_USD_UYU
): EstimatedPrice | null {
  if (product.currency_original === targetCurrency) {
    return null; // No conversion needed
  }

  const convertedAmount = convertPrice(
    product.price_original,
    product.currency_original,
    targetCurrency,
    exchangeRate
  );

  return {
    amount: convertedAmount,
    currency: targetCurrency,
    formatted: formatPrice(convertedAmount, targetCurrency),
  };
}

export function getEstimatedPriceUYU(
  product: Product,
  exchangeRate: number = DEFAULT_EXCHANGE_RATE_USD_UYU
): EstimatedPrice | null {
  return getEstimatedPrice(product, "UYU", exchangeRate);
}

export function getEstimatedPriceUSD(
  product: Product,
  exchangeRate: number = DEFAULT_EXCHANGE_RATE_USD_UYU
): EstimatedPrice | null {
  return getEstimatedPrice(product, "USD", exchangeRate);
}
