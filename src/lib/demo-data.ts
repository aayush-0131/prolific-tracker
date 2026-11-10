/**
 * Deterministic sample submissions for the public /demo page. No database, no
 * real user data: rows are generated from a fixed seed, dated relative to `now`
 * so the demo always looks current.
 */
import { calculateEarning } from "./earnings-calculator"
import type { Currency } from "./currency"

export interface DemoEarning {
  id: string
  studyTitle: string
  status: string
  reward: number
  bonus: number
  rewardCurrency: Currency
  bonusCurrency: Currency
  totalEarning: number
  normalizedGBP: number
  normalizedUSD: number
  startedAt: string | null
  completedAt: string | null
  durationMinutes: number | null
  hourlyRate: number | null
  source: string
  createdAt: string
}

const TITLES = [
  "Daily habits and wellbeing survey", "Decision making under uncertainty", "Voice quality rating task",
  "Short memory experiment", "Online shopping experiences", "Attitudes towards AI tools",
  "Reading comprehension study", "Product label perception", "Sleep and productivity diary",
  "Language learning questionnaire", "Image annotation batch", "Financial literacy quiz",
]
const STATUSES: [string, number][] = [
  ["APPROVED", 0.74], ["SCREENED OUT", 0.08], ["RETURNED", 0.08],
  ["AWAITING REVIEW", 0.06], ["REJECTED", 0.02], ["TIMED-OUT", 0.02],
]

const round2 = (n: number) => Math.round(n * 100) / 100

export function generateDemoEarnings(now: Date = new Date()): DemoEarning[] {
  let seed = 20261110
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648
  const pick = () => {
    const r = rnd()
    let acc = 0
    for (const [s, w] of STATUSES) if (r < (acc += w)) return s
    return "APPROVED"
  }
  const rows: DemoEarning[] = []
  for (let i = 0; i < 140; i++) {
    const daysAgo = Math.floor(rnd() * 120)
    const started = new Date(now.getTime() - daysAgo * 86_400_000)
    started.setHours([8, 9, 12, 13, 18, 19, 20, 21][Math.floor(rnd() * 8)], Math.floor(rnd() * 60), 0, 0)
    if (started > now) started.setDate(started.getDate() - 1)
    const minutes = 4 + Math.floor(rnd() * 36)
    const usd = rnd() < 0.3
    // Evenings and Tuesdays pay a bit more, so the "best time" insights have a pattern to show.
    const perHour = 7.5 + (started.getHours() >= 18 ? 3 : 0) + (started.getDay() === 2 ? 2 : 0) + rnd() * 2
    const reward = round2((perHour * minutes) / 60 * (usd ? 1.3 : 1))
    const status = pick()
    const bonus = status === "SCREENED OUT" ? 0.14 : rnd() < 0.12 ? 0.5 : 0
    const currency: Currency = usd ? "USD" : "GBP"
    const completed = status === "TIMED-OUT" ? null : new Date(started.getTime() + minutes * 60_000)
    const calc = calculateEarning({
      reward, rewardCurrency: currency, bonus, bonusCurrency: currency,
      startedAt: started, completedAt: completed, status,
    })
    rows.push({
      id: `demo-${i}`,
      studyTitle: TITLES[Math.floor(rnd() * TITLES.length)],
      status,
      reward,
      bonus,
      rewardCurrency: currency,
      bonusCurrency: currency,
      totalEarning: round2(calc.totalEarning),
      normalizedGBP: round2(calc.normalizedGBP),
      normalizedUSD: round2(calc.normalizedUSD),
      startedAt: started.toISOString(),
      completedAt: completed ? completed.toISOString() : null,
      durationMinutes: completed ? minutes : null,
      hourlyRate: calc.hourlyRate,
      source: "demo",
      createdAt: started.toISOString(),
    })
  }
  return rows.sort((a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? ""))
}
