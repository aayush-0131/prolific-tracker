/**
 * Single source of truth for "what counts as money earned" and how it is
 * summed. Pure functions (no I/O), safe to import from server and client.
 */

export type Currency = "GBP" | "USD"

export interface EarningAmounts {
  status: string
  rewardCurrency: string
  bonusCurrency?: string | null
  totalEarning: number | null
  normalizedGBP: number | null
  normalizedUSD: number | null
  durationMinutes?: number | null
}

/** Statuses where the reward itself was paid. */
const REWARD_PAID = ["APPROVED", "SCREENED OUT"]
/** Statuses where the reward was not paid, but a bonus may still have been. */
const BONUS_ONLY = ["RETURNED", "REJECTED", "TIMED-OUT"]

/**
 * Whether a submission represents money actually earned. Pending
 * ("AWAITING REVIEW") submissions never count; returned / rejected / timed-out
 * ones count only when a bonus was paid (totalEarning > 0).
 */
export function isCountable(e: EarningAmounts): boolean {
  if (REWARD_PAID.includes(e.status)) return true
  if (BONUS_ONLY.includes(e.status)) return (e.totalEarning ?? 0) > 0
  return false
}

/** Currency the money was actually paid in (the bonus currency when only the bonus was paid). */
export function paidCurrency(e: EarningAmounts): string {
  const rewardPaid = e.status === "APPROVED" || e.status === "AWAITING REVIEW"
  return rewardPaid ? e.rewardCurrency : e.bonusCurrency || e.rewardCurrency
}

/** The submission's value converted to one currency. */
export function amountIn(e: EarningAmounts, currency: Currency): number {
  return (currency === "USD" ? e.normalizedUSD : e.normalizedGBP) ?? 0
}

/** Sum of earned money in one currency (never mixes £ and $). */
export function sumCountable(earnings: EarningAmounts[], currency: Currency): number {
  return round2(earnings.filter(isCountable).reduce((sum, e) => sum + amountIn(e, currency), 0))
}

/**
 * Hourly rate as total earned / total time spent, over earned submissions
 * with a known duration. Unlike averaging per-study rates, this isn't skewed
 * by very short studies and never mixes currencies.
 */
export function realizedHourlyRate(earnings: EarningAmounts[], currency: Currency): number {
  let total = 0
  let minutes = 0
  for (const e of earnings) {
    const duration = e.durationMinutes ?? 0
    if (!isCountable(e) || duration <= 0) continue
    total += amountIn(e, currency)
    minutes += duration
  }
  return minutes > 0 ? round2((total / minutes) * 60) : 0
}

// ---------------------------------------------------------------------------
// CSV re-import
// ---------------------------------------------------------------------------

interface ImportedFields {
  status: string
  reward: number
  bonus: number
  rewardCurrency: string
  bonusCurrency: string | null
  totalEarning: number
  completedAt: Date | null
  completionCode: string | null
}

export interface ParsedImport extends ImportedFields {
  normalizedGBP: number
  normalizedUSD: number
  hourlyRate: number | null
  durationMinutes: number | null
}

const sameNumber = (a: number | null, b: number | null) =>
  a === b || (a !== null && b !== null && Math.abs(a - b) < 1e-9)
const sameDate = (a: Date | null, b: Date | null) =>
  (a?.getTime() ?? null) === (b?.getTime() ?? null)

/**
 * When a submission already exists (same study + start time), return the
 * fields to update from a newer export, or null if nothing changed. This is
 * how a study that was "AWAITING REVIEW" in an old export becomes "APPROVED".
 */
export function importChanges(existing: ImportedFields, parsed: ParsedImport): ParsedImport | null {
  const changed =
    existing.status !== parsed.status ||
    !sameNumber(existing.reward, parsed.reward) ||
    !sameNumber(existing.bonus, parsed.bonus) ||
    existing.rewardCurrency !== parsed.rewardCurrency ||
    (existing.bonusCurrency ?? null) !== (parsed.bonusCurrency ?? null) ||
    !sameNumber(existing.totalEarning, parsed.totalEarning) ||
    !sameDate(existing.completedAt, parsed.completedAt) ||
    (existing.completionCode ?? null) !== (parsed.completionCode ?? null)

  if (!changed) return null

  return {
    status: parsed.status,
    reward: parsed.reward,
    bonus: parsed.bonus,
    rewardCurrency: parsed.rewardCurrency,
    bonusCurrency: parsed.bonusCurrency,
    totalEarning: parsed.totalEarning,
    normalizedGBP: parsed.normalizedGBP,
    normalizedUSD: parsed.normalizedUSD,
    hourlyRate: parsed.hourlyRate,
    durationMinutes: parsed.durationMinutes,
    completedAt: parsed.completedAt,
    completionCode: parsed.completionCode,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * For each row, how many earlier rows in the same file share its key (0 for
 * the first copy, 1 for the second, ...). Prolific exports can contain truly
 * identical rows (e.g. a study returned twice before it was started), so the
 * n-th copy in a file is matched to the n-th stored copy instead of all
 * copies collapsing into one.
 */
export function occurrenceIndexes<T>(rows: T[], key: (row: T) => string): number[] {
  const seen = new Map<string, number>()
  return rows.map((row) => {
    const k = key(row)
    const n = seen.get(k) ?? 0
    seen.set(k, n + 1)
    return n
  })
}
