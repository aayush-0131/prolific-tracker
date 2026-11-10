import { test } from "node:test"
import assert from "node:assert/strict"
import {
  taxYearStart,
  taxYearLabel,
  taxYearTotals,
  ratesByWeekday,
  ratesByHour,
  bestBucket,
  accountHealth,
} from "../insights"

// Local-time dates keep these tests independent of the machine's timezone.
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h)
const study = (o: Record<string, unknown>) => ({
  status: "APPROVED",
  rewardCurrency: "GBP",
  bonusCurrency: null,
  totalEarning: 0,
  normalizedGBP: 0,
  normalizedUSD: 0,
  durationMinutes: null as number | null,
  startedAt: null as Date | string | null,
  ...o,
})

test("UK tax year starts on 6 April", () => {
  assert.deepEqual(taxYearStart(at(2026, 4, 5), 4), new Date(2025, 3, 6))
  assert.deepEqual(taxYearStart(at(2026, 4, 6, 0), 4), new Date(2026, 3, 6))
  assert.deepEqual(taxYearStart(at(2026, 11, 10), 4), new Date(2026, 3, 6))
  assert.equal(taxYearLabel(new Date(2026, 3, 6)), "2026/27")
})

test("other tax years start on the 1st of the chosen month", () => {
  assert.deepEqual(taxYearStart(at(2026, 11, 10), 1), new Date(2026, 0, 1))
  assert.equal(taxYearLabel(new Date(2026, 0, 1)), "2026")
  assert.deepEqual(taxYearStart(at(2026, 3, 1), 7), new Date(2025, 6, 1))
  assert.equal(taxYearLabel(new Date(2025, 6, 1)), "2025/26")
})

test("tax year totals only include earned money inside each year", () => {
  const earnings = [
    study({ startedAt: at(2026, 4, 5), totalEarning: 1, normalizedGBP: 1, normalizedUSD: 1.3 }), // previous UK year
    study({ startedAt: at(2026, 4, 6), totalEarning: 2, normalizedGBP: 2, normalizedUSD: 2.6 }), // current
    study({ startedAt: at(2026, 11, 1), rewardCurrency: "USD", totalEarning: 4, normalizedGBP: 3, normalizedUSD: 4 }),
    study({ startedAt: at(2026, 11, 2), status: "AWAITING REVIEW", totalEarning: 9, normalizedGBP: 9, normalizedUSD: 12 }),
  ]
  const { current, previous } = taxYearTotals(earnings, at(2026, 11, 10), 4, "USD")
  assert.equal(current.label, "2026/27")
  assert.equal(current.earned, 6.6)
  assert.equal(current.earnedGBP, 5)
  assert.equal(current.studies, 2)
  assert.equal(previous.label, "2025/26")
  assert.equal(previous.earnedGBP, 1)
})

test("hourly rate by weekday and hour uses total earned / total time", () => {
  const mon9 = at(2026, 11, 9, 9) // Monday
  const earnings = [
    study({ startedAt: mon9, totalEarning: 3, normalizedGBP: 3, durationMinutes: 30 }),
    study({ startedAt: new Date(2026, 10, 9, 9, 40), totalEarning: 1, normalizedGBP: 1, durationMinutes: 30 }),
    study({ startedAt: at(2026, 11, 10, 20), totalEarning: 5, normalizedGBP: 5, durationMinutes: 20 }), // Tue 20:00
    study({ startedAt: at(2026, 11, 10, 20), status: "RETURNED", totalEarning: 0, durationMinutes: 40 }), // unpaid: ignored
  ]
  const days = ratesByWeekday(earnings, "GBP")
  assert.deepEqual(days.map((d) => d.label), ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
  assert.equal(days[0].rate, 4) // £4 over 1 hour
  assert.equal(days[0].studies, 2)
  assert.equal(days[1].rate, 15) // £5 over 20 min
  const hours = ratesByHour(earnings, "GBP")
  assert.equal(hours.length, 24)
  assert.equal(hours[9].rate, 4)
  assert.equal(hours[20].label, "20:00")
})

test("best bucket needs a minimum number of studies", () => {
  const buckets = [
    { key: 0, label: "a", earned: 10, minutes: 30, rate: 20, studies: 1 },
    { key: 1, label: "b", earned: 12, minutes: 60, rate: 12, studies: 5 },
    { key: 2, label: "c", earned: 0, minutes: 0, rate: 0, studies: 0 },
  ]
  assert.equal(bestBucket(buckets, 3)?.label, "b")
  assert.equal(bestBucket(buckets.slice(0, 1), 3), null)
})

test("account health: approval rate counts reviewed submissions only; unpaid time is tallied", () => {
  const h = accountHealth([
    study({ status: "APPROVED" }),
    study({ status: "APPROVED" }),
    study({ status: "APPROVED" }),
    study({ status: "REJECTED", durationMinutes: 10 }),
    study({ status: "SCREENED OUT", totalEarning: 0.1, durationMinutes: 2 }),
    study({ status: "RETURNED", durationMinutes: 15 }),
    study({ status: "RETURNED", totalEarning: 0.5, durationMinutes: 5 }), // paid bonus: not "unpaid"
    study({ status: "TIMED-OUT", durationMinutes: null }),
    study({ status: "AWAITING REVIEW", durationMinutes: 30 }),
  ])
  assert.equal(h.approvalRate, 0.75)
  assert.equal(h.screenOutRate, 1 / 9)
  assert.equal(h.returnRate, 2 / 9)
  assert.equal(h.unpaidMinutes, 25)
  assert.equal(h.pending, 1)
  assert.equal(accountHealth([]).approvalRate, null)
})
