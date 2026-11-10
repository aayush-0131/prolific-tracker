/**
 * Insights computed from a user's submissions. Pure functions, run in the
 * browser so weekdays/hours are in the user's own timezone.
 */
import { amountIn, isCountable, type Currency, type EarningAmounts } from "./earning-rules"

export interface InsightEarning extends EarningAmounts {
  startedAt: string | Date | null
}

// ---------------------------------------------------------------------------
// Tax years
// ---------------------------------------------------------------------------

/** UK self-employment "trading allowance": gross income per tax year. */
export const UK_TRADING_ALLOWANCE_GBP = 1000

/** Start of the tax year containing `date`. April means the UK tax year (6 April). */
export function taxYearStart(date: Date, startMonth: number): Date {
  const day = startMonth === 4 ? 6 : 1
  const thisYear = new Date(date.getFullYear(), startMonth - 1, day)
  return date >= thisYear ? thisYear : new Date(date.getFullYear() - 1, startMonth - 1, day)
}

/** "2026" for calendar years, "2026/27" for years that straddle January. */
export function taxYearLabel(start: Date): string {
  const y = start.getFullYear()
  return start.getMonth() === 0 ? `${y}` : `${y}/${String((y + 1) % 100).padStart(2, "0")}`
}

export interface TaxYearTotal {
  label: string
  start: Date
  end: Date // exclusive
  earned: number // in the requested currency
  earnedGBP: number // for the UK trading allowance
  studies: number
}

export function taxYearTotals(
  earnings: InsightEarning[],
  now: Date,
  startMonth: number,
  currency: Currency
): { current: TaxYearTotal; previous: TaxYearTotal } {
  const currentStart = taxYearStart(now, startMonth)
  const previousStart = taxYearStart(new Date(currentStart.getTime() - 1), startMonth)
  const nextStart = new Date(currentStart.getFullYear() + 1, currentStart.getMonth(), currentStart.getDate())

  const total = (start: Date, end: Date): TaxYearTotal => {
    let earned = 0
    let earnedGBP = 0
    let studies = 0
    for (const e of earnings) {
      const started = toDate(e.startedAt)
      if (!started || started < start || started >= end || !isCountable(e)) continue
      earned += amountIn(e, currency)
      earnedGBP += amountIn(e, "GBP")
      studies++
    }
    return { label: taxYearLabel(start), start, end, earned: round2(earned), earnedGBP: round2(earnedGBP), studies }
  }

  return { current: total(currentStart, nextStart), previous: total(previousStart, currentStart) }
}

// ---------------------------------------------------------------------------
// When you earn best
// ---------------------------------------------------------------------------

export interface RateBucket {
  key: number
  label: string
  earned: number
  minutes: number
  rate: number // per hour, in the requested currency
  studies: number
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function bucketRates(
  earnings: InsightEarning[],
  currency: Currency,
  keys: number[],
  keyOf: (d: Date) => number,
  labelOf: (key: number) => string
): RateBucket[] {
  const map = new Map(keys.map((k) => [k, { earned: 0, minutes: 0, studies: 0 }]))
  for (const e of earnings) {
    const started = toDate(e.startedAt)
    const minutes = e.durationMinutes ?? 0
    if (!started || minutes <= 0 || !isCountable(e)) continue
    const b = map.get(keyOf(started))!
    b.earned += amountIn(e, currency)
    b.minutes += minutes
    b.studies++
  }
  return keys.map((key) => {
    const b = map.get(key)!
    return {
      key,
      label: labelOf(key),
      earned: round2(b.earned),
      minutes: b.minutes,
      rate: b.minutes > 0 ? round2((b.earned / b.minutes) * 60) : 0,
      studies: b.studies,
    }
  })
}

/** Hourly rate per weekday, Monday first. */
export function ratesByWeekday(earnings: InsightEarning[], currency: Currency): RateBucket[] {
  return bucketRates(earnings, currency, [1, 2, 3, 4, 5, 6, 0], (d) => d.getDay(), (k) => WEEKDAYS[k])
}

/** Hourly rate per hour of day (when the study was started). */
export function ratesByHour(earnings: InsightEarning[], currency: Currency): RateBucket[] {
  const hours = Array.from({ length: 24 }, (_, h) => h)
  return bucketRates(earnings, currency, hours, (d) => d.getHours(), (h) => `${String(h).padStart(2, "0")}:00`)
}

/** Highest-rate bucket with enough studies to be meaningful. */
export function bestBucket(buckets: RateBucket[], minStudies = 3): RateBucket | null {
  return buckets
    .filter((b) => b.studies >= minStudies)
    .reduce<RateBucket | null>((best, b) => (!best || b.rate > best.rate ? b : best), null)
}

// ---------------------------------------------------------------------------
// Account health
// ---------------------------------------------------------------------------

export interface AccountHealth {
  total: number
  approved: number
  rejected: number
  returned: number
  screenedOut: number
  timedOut: number
  pending: number
  approvalRate: number | null // approved / (approved + rejected)
  screenOutRate: number | null // of all submissions
  returnRate: number | null // of all submissions
  unpaidMinutes: number // time spent on submissions that paid nothing
}

export function accountHealth(earnings: InsightEarning[]): AccountHealth {
  const count = (status: string) => earnings.filter((e) => e.status === status).length
  const total = earnings.length
  const approved = count("APPROVED")
  const rejected = count("REJECTED")
  const returned = count("RETURNED")
  const screenedOut = count("SCREENED OUT")
  const unpaidMinutes = earnings
    .filter((e) => e.status !== "AWAITING REVIEW" && !isCountable(e))
    .reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0)

  return {
    total,
    approved,
    rejected,
    returned,
    screenedOut,
    timedOut: count("TIMED-OUT"),
    pending: count("AWAITING REVIEW"),
    approvalRate: approved + rejected > 0 ? approved / (approved + rejected) : null,
    screenOutRate: total > 0 ? screenedOut / total : null,
    returnRate: total > 0 ? returned / total : null,
    unpaidMinutes: Math.round(unpaidMinutes),
  }
}

function toDate(value: string | Date | null): Date | null {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return isNaN(d.getTime()) ? null : d
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
