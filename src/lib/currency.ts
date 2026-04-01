export type Currency = "GBP" | "USD"

export interface CurrencyAmount {
  amount: number
  currency: Currency
}

// ============================================
// 💱 EXCHANGE RATE CONFIGURATION
// ============================================

// Fallback rates (used if API fails)
const FALLBACK_RATES = {
  GBP_TO_USD: 1.33,
  USD_TO_GBP: 0.75,
}

// Cache configuration
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

// Rate cache
interface RateCache {
  USD_TO_GBP: number
  GBP_TO_USD: number
  lastUpdated: number
  isLive: boolean
}

let rateCache: RateCache = {
  USD_TO_GBP: FALLBACK_RATES.USD_TO_GBP,
  GBP_TO_USD: FALLBACK_RATES.GBP_TO_USD,
  lastUpdated: 0,
  isLive: false,
}

// ============================================
// 🌐 FETCH LIVE EXCHANGE RATES
// ============================================

/**
 * Fetch live exchange rates from ExchangeRate-API (free, no signup)
 * Caches rates for 1 hour to minimize API calls
 */
export async function fetchLiveRates(): Promise<RateCache> {
  // Return cached rates if still valid
  if (Date.now() - rateCache.lastUpdated < CACHE_TTL && rateCache.isLive) {
    return rateCache
  }

  try {
    // Free API - no signup required, 1500 requests/month
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      {
        next: { revalidate: 3600 } // Cache in Next.js for 1 hour
      }
    )

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Extract rates
    const usdToGbp = data.rates.GBP
    const gbpToUsd = 1 / usdToGbp

    // Update cache
    rateCache = {
      USD_TO_GBP: usdToGbp,
      GBP_TO_USD: gbpToUsd,
      lastUpdated: Date.now(),
      isLive: true,
    }

    console.log(`✅ Live exchange rates updated: 1 USD = £${usdToGbp.toFixed(4)}`)

    return rateCache
  } catch (error) {
    console.error("❌ Failed to fetch live exchange rates:", error)
    console.log("⚠️ Using fallback rates")

    // Return cached rates (might be stale) or fallback
    return rateCache.isLive ? rateCache : {
      USD_TO_GBP: FALLBACK_RATES.USD_TO_GBP,
      GBP_TO_USD: FALLBACK_RATES.GBP_TO_USD,
      lastUpdated: Date.now(),
      isLive: false,
    }
  }
}

/**
 * Get current exchange rate (from cache or fallback)
 * Use this for synchronous operations
 */
export function getCurrentRates(): RateCache {
  return rateCache
}

/**
 * Get exchange rate info for display
 */
export function getRateInfo(): { rate: number; isLive: boolean; lastUpdated: Date | null } {
  return {
    rate: rateCache.USD_TO_GBP,
    isLive: rateCache.isLive,
    lastUpdated: rateCache.lastUpdated ? new Date(rateCache.lastUpdated) : null,
  }
}

// ============================================
// 💰 CURRENCY PARSING
// ============================================

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

// ============================================
// 🔄 CURRENCY CONVERSION (SYNCHRONOUS)
// ============================================

/**
 * Convert currency using cached rates
 * Falls back to hardcoded rates if cache is empty
 */
export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount
  if (amount === 0) return 0

  if (from === "GBP" && to === "USD") {
    return amount * rateCache.GBP_TO_USD
  }
  if (from === "USD" && to === "GBP") {
    return amount * rateCache.USD_TO_GBP
  }
  return amount
}

export function normalizeToGBP(amount: number, currency: Currency): number {
  return convertCurrency(amount, currency, "GBP")
}

export function normalizeToUSD(amount: number, currency: Currency): number {
  return convertCurrency(amount, currency, "USD")
}

// ============================================
// 🔄 CURRENCY CONVERSION (ASYNC - FRESH RATES)
// ============================================

/**
 * Convert currency with fresh rates from API
 * Use this when you need guaranteed up-to-date rates
 */
export async function convertCurrencyAsync(
  amount: number,
  from: Currency,
  to: Currency
): Promise<number> {
  if (from === to) return amount
  if (amount === 0) return 0

  // Fetch fresh rates
  const rates = await fetchLiveRates()

  if (from === "GBP" && to === "USD") {
    return amount * rates.GBP_TO_USD
  }
  if (from === "USD" && to === "GBP") {
    return amount * rates.USD_TO_GBP
  }
  return amount
}

export async function normalizeToGBPAsync(amount: number, currency: Currency): Promise<number> {
  return convertCurrencyAsync(amount, currency, "GBP")
}

export async function normalizeToUSDAsync(amount: number, currency: Currency): Promise<number> {
  return convertCurrencyAsync(amount, currency, "USD")
}

// ============================================
// 📊 FORMATTING & UTILITIES
// ============================================

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

/**
 * Calculate mixed total with fresh rates
 */
export async function calculateMixedTotalAsync(
  amounts: Array<{ amount: number; currency: Currency }>,
  preferredCurrency: Currency = "GBP"
): Promise<number> {
  // Fetch fresh rates first
  await fetchLiveRates()

  return amounts.reduce((total, item) => {
    const normalized = convertCurrency(item.amount, item.currency, preferredCurrency)
    return total + normalized
  }, 0)
}

// ============================================
// 🚀 INITIALIZATION
// ============================================

/**
 * Initialize exchange rates on app startup
 * Call this in your layout.tsx or a server action
 */
export async function initExchangeRates(): Promise<void> {
  try {
    await fetchLiveRates()
  } catch (error) {
    console.error("Failed to initialize exchange rates:", error)
  }
}
