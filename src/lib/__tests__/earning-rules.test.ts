import { test } from "node:test"
import assert from "node:assert/strict"
import {
  isCountable,
  paidCurrency,
  amountIn,
  sumCountable,
  realizedHourlyRate,
  importChanges,
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
