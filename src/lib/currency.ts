export type Currency = "GBP" | "USD"

export interface CurrencyAmount {
  amount: number
  currency: Currency
}

export function parseCurrency(value: string): CurrencyAmount {
  const cleaned = value.trim()
  if (cleaned === "" || cleaned === "0" || cleaned === "$0.00" || cleaned === "£0.00") {
    return { amount: 0, currency: "GBP" }
  }
  if (cleaned.startsWith("£")) {
    const amount = parseFloat(cleaned.slice(1).replace(/,/g, ""))
    return { amount: isNaN(amount) ? 0 : amount, currency: "GBP" }
  } else if (cleaned.startsWith("$")) {
    const amount = parseFloat(cleaned.slice(1).replace(/,/g, ""))
    return { amount: isNaN(amount) ? 0 : amount, currency: "USD" }
  }
  const amount = parseFloat(cleaned.replace(/,/g, ""))
  return { amount: isNaN(amount) ? 0 : amount, currency: "GBP" }
}

const CONVERSION_RATES = {
  GBP_TO_USD: 1.27,
  USD_TO_GBP: 0.79,
}

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount
  if (from === "GBP" && to === "USD") return amount * CONVERSION_RATES.GBP_TO_USD
  if (from === "USD" && to === "GBP") return amount * CONVERSION_RATES.USD_TO_GBP
  return amount
}

export function normalizeToGBP(amount: number, currency: Currency): number {
  return convertCurrency(amount, currency, "GBP")
}

export function normalizeToUSD(amount: number, currency: Currency): number {
  return convertCurrency(amount, currency, "USD")
}

export function formatCurrency(amount: number, currency: Currency = "GBP"): string {
  const symbol = currency === "GBP" ? "£" : "$"
  return `${symbol}${amount.toFixed(2)}`
}

export function calculateMixedTotal(
  amounts: Array<{ amount: number; currency: Currency }>,
  preferredCurrency: Currency = "GBP"
): number {
  return amounts.reduce((total, item) => {
    const normalized = convertCurrency(item.amount, item.currency, preferredCurrency)
    return total + normalized
  }, 0)
}
