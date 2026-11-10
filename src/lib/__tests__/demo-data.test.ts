import { test } from "node:test"
import assert from "node:assert/strict"
import { generateDemoEarnings } from "../demo-data"
import { isCountable, sumCountable, realizedHourlyRate } from "../earning-rules"

const NOW = new Date(2026, 10, 10, 12)

test("demo data is deterministic for a given date", () => {
  assert.deepEqual(generateDemoEarnings(NOW), generateDemoEarnings(NOW))
})

test("demo data covers every status, both currencies and stays in the past ~4 months", () => {
  const rows = generateDemoEarnings(NOW)
  assert.ok(rows.length >= 100)
  for (const s of ["APPROVED", "AWAITING REVIEW", "SCREENED OUT", "RETURNED", "REJECTED", "TIMED-OUT"]) {
    assert.ok(rows.some((r) => r.status === s), s)
  }
  assert.ok(rows.some((r) => r.rewardCurrency === "GBP") && rows.some((r) => r.rewardCurrency === "USD"))
  const oldest = NOW.getTime() - 130 * 86_400_000
  for (const r of rows) {
    const t = new Date(r.startedAt!).getTime()
    assert.ok(t <= NOW.getTime() && t >= oldest, r.studyTitle)
  }
})

test("demo rows follow the app's earning rules (totals add up, rate is sane)", () => {
  const rows = generateDemoEarnings(NOW)
  for (const r of rows) {
    assert.ok(Number.isFinite(r.totalEarning) && r.totalEarning >= 0)
    if (r.status === "APPROVED") assert.equal(r.totalEarning, Math.round((r.reward + r.bonus) * 100) / 100)
  }
  assert.ok(rows.filter(isCountable).length > 50)
  assert.ok(sumCountable(rows, "GBP") > 0)
  const rate = realizedHourlyRate(rows, "GBP")
  assert.ok(rate > 5 && rate < 20, `hourly rate ${rate}`)
})
