import { test } from "node:test"
import assert from "node:assert/strict"
import {
  isCountable,
  paidCurrency,
  amountIn,
  sumCountable,
  realizedHourlyRate,
  importChanges,
  occurrenceIndexes,
  earnedWhere,
} from "../earning-rules"

const e = (o: Partial<Parameters<typeof isCountable>[0]> & Record<string, unknown>) => ({
  status: "APPROVED",
  rewardCurrency: "GBP",
  bonusCurrency: null,
  totalEarning: 0,
  normalizedGBP: 0,
  normalizedUSD: 0,
  durationMinutes: null,
  ...o,
})

test("approved and screened-out submissions always count", () => {
  assert.equal(isCountable(e({ status: "APPROVED" })), true)
  assert.equal(isCountable(e({ status: "SCREENED OUT" })), true)
})

test("pending submissions never count", () => {
  assert.equal(isCountable(e({ status: "AWAITING REVIEW", totalEarning: 5 })), false)
})

test("returned/rejected/timed-out count only when something was actually paid (bonus)", () => {
  for (const status of ["RETURNED", "REJECTED", "TIMED-OUT"]) {
    assert.equal(isCountable(e({ status, totalEarning: 0 })), false, status)
    assert.equal(isCountable(e({ status, totalEarning: 0.5 })), true, status)
  }
})

test("the paid currency is the bonus currency when the reward was not paid", () => {
  assert.equal(paidCurrency(e({ status: "APPROVED", rewardCurrency: "USD", bonusCurrency: "GBP" })), "USD")
  assert.equal(paidCurrency(e({ status: "SCREENED OUT", rewardCurrency: "USD", bonusCurrency: "GBP" })), "GBP")
  assert.equal(paidCurrency(e({ status: "RETURNED", rewardCurrency: "GBP", bonusCurrency: null })), "GBP")
})

test("amounts are summed in one currency, never mixing £ and $", () => {
  const day = [
    e({ totalEarning: 3, normalizedGBP: 3, normalizedUSD: 4 }), // £3
    e({ rewardCurrency: "USD", totalEarning: 10, normalizedGBP: 7.5, normalizedUSD: 10 }), // $10
    e({ status: "AWAITING REVIEW", totalEarning: 2, normalizedGBP: 2, normalizedUSD: 2.66 }),
  ]
  assert.equal(sumCountable(day, "GBP"), 10.5)
  assert.equal(sumCountable(day, "USD"), 14)
  assert.equal(amountIn(day[1], "GBP"), 7.5)
})

test("hourly rate is total earned / total time, in the requested currency", () => {
  const studies = [
    e({ totalEarning: 3, normalizedGBP: 3, normalizedUSD: 4, durationMinutes: 30 }), // £6/hr
    e({ rewardCurrency: "USD", totalEarning: 10, normalizedGBP: 7.5, normalizedUSD: 10, durationMinutes: 30 }), // $20/hr
    e({ status: "AWAITING REVIEW", totalEarning: 9, normalizedGBP: 9, normalizedUSD: 12, durationMinutes: 1 }),
    e({ totalEarning: 1, normalizedGBP: 1, normalizedUSD: 1.33, durationMinutes: null }),
  ]
  assert.equal(realizedHourlyRate(studies, "GBP"), 10.5) // £10.50 over 1 hour
  assert.equal(realizedHourlyRate(studies, "USD"), 14)
  assert.equal(realizedHourlyRate([], "GBP"), 0)
})

test("re-importing a submission whose status changed produces an update", () => {
  const existing = { status: "AWAITING REVIEW", reward: 2, bonus: 0, rewardCurrency: "GBP", bonusCurrency: "GBP", totalEarning: 2, completedAt: new Date("2026-11-03T10:20:00Z"), completionCode: "P1" }
  const parsed = { ...existing, status: "APPROVED", normalizedGBP: 2, normalizedUSD: 2.67, hourlyRate: 6, durationMinutes: 20 }
  assert.deepEqual(importChanges(existing, parsed), {
    status: "APPROVED", reward: 2, bonus: 0, rewardCurrency: "GBP", bonusCurrency: "GBP", totalEarning: 2,
    normalizedGBP: 2, normalizedUSD: 2.67, hourlyRate: 6, durationMinutes: 20,
    completedAt: new Date("2026-11-03T10:20:00Z"), completionCode: "P1",
  })
})

test("re-importing an unchanged submission is a no-op", () => {
  const row = { status: "APPROVED", reward: 2, bonus: 0.5, rewardCurrency: "GBP", bonusCurrency: "GBP", totalEarning: 2.5, completedAt: new Date("2026-11-03T10:20:00Z"), completionCode: "P1" }
  assert.equal(importChanges(row, { ...row, normalizedGBP: 2.5, normalizedUSD: 3.3, hourlyRate: 7.5, durationMinutes: 20 }), null)
})

test("a newly added bonus is picked up on re-import", () => {
  const existing = { status: "APPROVED", reward: 2, bonus: 0, rewardCurrency: "GBP", bonusCurrency: "GBP", totalEarning: 2, completedAt: null, completionCode: null }
  const changes = importChanges(existing, { ...existing, bonus: 1, totalEarning: 3, normalizedGBP: 3, normalizedUSD: 4, hourlyRate: null, durationMinutes: null })
  assert.equal(changes?.bonus, 1)
  assert.equal(changes?.totalEarning, 3)
})

// Regression: a real Prolific export contained two identical rows (same study
// returned twice, no start time). They were merged into one, so the tracker
// showed 639 submissions instead of 640.
test("identical rows in one file get distinct occurrence indexes", () => {
  const rows = [
    { title: "VR Study", started: null },
    { title: "Other", started: "2026-11-01" },
    { title: "VR Study", started: null },
    { title: "VR Study", started: "2026-11-02" },
    { title: "VR Study", started: null },
  ]
  const key = (r: (typeof rows)[number]) => `${r.title}|${r.started ?? ""}`
  assert.deepEqual(occurrenceIndexes(rows, key), [0, 0, 1, 0, 2])
})

// The database filter used by "Recent Earnings" must select exactly the rows
// isCountable() treats as earned, so the dashboard and the totals agree.
test("earnedWhere() selects exactly the rows isCountable() counts", () => {
  type W = { OR: Array<{ status: { in: string[] }; totalEarning?: { gt: number } }> }
  const where = earnedWhere() as W
  const matches = (row: { status: string; totalEarning: number | null }) =>
    where.OR.some((c) => c.status.in.includes(row.status) && (!c.totalEarning || (row.totalEarning ?? 0) > c.totalEarning.gt))
  const statuses = ["APPROVED", "SCREENED OUT", "RETURNED", "REJECTED", "TIMED-OUT", "AWAITING REVIEW", "UNKNOWN"]
  for (const status of statuses) {
    for (const totalEarning of [0, 0.5]) {
      const row = e({ status, totalEarning })
      assert.equal(matches(row), isCountable(row), `${status} / ${totalEarning}`)
    }
  }
})
