import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 🔥 FIX: Handle undefined/null/NaN amounts
export function formatCurrency(amount: number | undefined | null, currency: string = "GBP"): string {
  const symbol = currency === "GBP" ? "£" : "$"
  const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0
  return `${symbol}${safeAmount.toFixed(2)}`
}

// 🔥 FIX: Handle undefined/null/NaN numbers
export function formatNumber(num: number | undefined | null, decimals: number = 2): string {
  const safeNum = typeof num === "number" && !isNaN(num) ? num : 0
  return safeNum.toFixed(decimals)
}

export function calculatePercentageChange(current: number | undefined | null, previous: number | undefined | null): number {
  const safeCurrent = typeof current === "number" && !isNaN(current) ? current : 0
  const safePrevious = typeof previous === "number" && !isNaN(previous) ? previous : 0

  if (safePrevious === 0) return safeCurrent > 0 ? 100 : 0
  return ((safeCurrent - safePrevious) / safePrevious) * 100
}

// 🔥 FIX: Handle undefined/null text
export function truncateText(text: string | undefined | null, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

// 🔥 FIX: Handle undefined/null name
export function getInitials(name: string | undefined | null): string {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"
}

// 🔥 BONUS: Sleep utility for delays
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 🔥 BONUS: Format date for display
export function formatDate(date: Date | string | undefined | null): string {
  if (!date) return "Unknown date"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "Invalid date"
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// 🔥 BONUS: Format time duration
export function formatDuration(minutes: number | undefined | null): string {
  const safeMinutes = typeof minutes === "number" && !isNaN(minutes) ? minutes : 0
  if (safeMinutes < 60) return `${Math.round(safeMinutes)} min`
  const hours = Math.floor(safeMinutes / 60)
  const mins = Math.round(safeMinutes % 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}
