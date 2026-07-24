export const CURRENCY_DECIMALS: Record<string, number> = {
  USD: 2,
  NGN: 2,
  GBP: 2,
  EUR: 2,
  KES: 2,
  GHS: 2,
  ZAR: 2,
  XOF: 0,
  XAF: 0,
  EGP: 2,
};

export function getCurrencyDecimals(currency: string): number {
  return CURRENCY_DECIMALS[currency.toUpperCase()] ?? 2;
}

export function toLowestUnit(amount: number, currency: string): number {
  const decimals = getCurrencyDecimals(currency);
  return Math.round(amount * Math.pow(10, decimals));
}

export function fromLowestUnit(amountInLowest: number, currency: string): number {
  const decimals = getCurrencyDecimals(currency);
  return amountInLowest / Math.pow(10, decimals);
}

export function formatCurrency(amount: number, currency: string): string {
  const decimals = getCurrencyDecimals(currency);
  const fixed = amount.toFixed(decimals);
  return `${currency.toUpperCase()} ${fixed}`;
}
