"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import type { Currency } from "@/lib/earning-rules"
import {
  UK_TRADING_ALLOWANCE_GBP,
  accountHealth,
  bestBucket,
  ratesByHour,
  ratesByWeekday,
  taxYearTotals,
  type InsightEarning,
  type RateBucket,
} from "@/lib/insights"

// One series per chart: a single hue, with the best bucket a darker step of it.
const BAR = "#93c5fd" // blue-300
const BAR_BEST = "#1d4ed8" // blue-700

/** The Insights cards for a set of earnings; used by /insights and the public /demo. */
export function InsightsView({
  earnings,
  currency,
  fiscalYearStart,
}: {
  earnings: InsightEarning[]
  currency: Currency
  fiscalYearStart: number
}) {
  const insights = useMemo(() => {
    const weekdays = ratesByWeekday(earnings, currency)
    const hours = ratesByHour(earnings, currency)
    return {
      tax: taxYearTotals(earnings, new Date(), fiscalYearStart, currency),
      weekdays,
      hours,
      bestDay: bestBucket(weekdays),
      bestHour: bestBucket(hours),
      health: accountHealth(earnings),
    }
  }, [earnings, currency, fiscalYearStart])

  const { tax, weekdays, hours, bestDay, bestHour, health } = insights
  const money = (n: number) => formatCurrency(n, currency)
  const isUkTaxYear = fiscalYearStart === 4
  const allowanceUsed = Math.min((tax.current.earnedGBP / UK_TRADING_ALLOWANCE_GBP) * 100, 100)
  const hasTimedStudies = weekdays.some((d) => d.studies > 0)

  return (
    <div className="space-y-6">
      {/* Tax year */}
      <Card>
        <CardHeader>
          <CardTitle>Tax year {tax.current.label}</CardTitle>
          <CardDescription>
            {formatDay(tax.current.start)} – {formatDay(new Date(tax.current.end.getTime() - 1))} · approved, screened-out
            and paid bonuses only
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-end gap-x-10 gap-y-3">
            <div>
              <p className="text-3xl font-bold">{money(tax.current.earned)}</p>
              <p className="text-sm text-muted-foreground">
                {tax.current.studies} {tax.current.studies === 1 ? "study" : "studies"} this tax year
              </p>
            </div>
            <div>
              <p className="text-xl font-semibold text-muted-foreground">{money(tax.previous.earned)}</p>
              <p className="text-sm text-muted-foreground">Tax year {tax.previous.label}</p>
            </div>
          </div>

          {isUkTaxYear ? (
            <div className="space-y-2">
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="font-medium">UK £1,000 trading allowance</span>
                <span className="text-muted-foreground">
                  £{tax.current.earnedGBP.toFixed(2)} used ·{" "}
                  {tax.current.earnedGBP >= UK_TRADING_ALLOWANCE_GBP
                    ? `£${(tax.current.earnedGBP - UK_TRADING_ALLOWANCE_GBP).toFixed(2)} over`
                    : `£${(UK_TRADING_ALLOWANCE_GBP - tax.current.earnedGBP).toFixed(2)} left`}
                </span>
              </div>
              <Progress value={allowanceUsed} className="h-3" aria-label="Trading allowance used" />
              <p className="text-xs text-muted-foreground">
                The allowance covers your total gross income from all side work in the tax year, not just Prolific.
                For reference only, not tax advice.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              In the UK? Set <Link href="/settings" className="text-primary hover:underline">Tax Year Start</Link> to
              April to track the £1,000 trading allowance.
            </p>
          )}
        </CardContent>
      </Card>

      {/* When you earn best */}
      <Card>
        <CardHeader>
          <CardTitle>When you earn best</CardTitle>
          <CardDescription>
            Your hourly rate (total earned ÷ time spent) by when you started the study, in your local time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasTimedStudies ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No earned studies with start and completion times yet.{" "}
              <Link href="/upload" className="text-primary hover:underline">Upload a Prolific CSV</Link> to see this.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <Callout
                  title="Best day"
                  bucket={bestDay}
                  name={bestDay ? fullWeekday(bestDay.label) : ""}
                  money={money}
                />
                <Callout
                  title="Best time to start"
                  bucket={bestHour}
                  name={bestHour ? `${bestHour.label}–${String((bestHour.key + 1) % 24).padStart(2, "0")}:00` : ""}
                  money={money}
                />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <RateChart title="By day of week" data={weekdays} best={bestDay} money={money} tickEvery={0} />
                <RateChart title="By hour of day" data={hours} best={bestHour} money={money} tickEvery={2} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account health */}
      <Card>
        <CardHeader>
          <CardTitle>Account health</CardTitle>
          <CardDescription>Across all {health.total} submissions you&apos;ve tracked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat
              label="Approval rate"
              value={pct(health.approvalRate)}
              hint={`${health.approved} approved · ${health.rejected} rejected`}
            />
            <Stat label="Screened out" value={pct(health.screenOutRate)} hint={`${health.screenedOut} submissions`} />
            <Stat label="Returned" value={pct(health.returnRate)} hint={`${health.returned} submissions`} />
            <Stat
              label="Unpaid time"
              value={formatMinutes(health.unpaidMinutes)}
              hint="on returned, rejected or timed-out studies that paid nothing"
            />
          </div>
          {health.pending > 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              {health.pending} {health.pending === 1 ? "submission is" : "submissions are"} awaiting review. Re-upload a
              newer Prolific export to update their status.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Callout({
  title,
  bucket,
  name,
  money,
}: {
  title: string
  bucket: RateBucket | null
  name: string
  money: (n: number) => string
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      {bucket ? (
        <>
          <p className="text-xl font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">
            {money(bucket.rate)}/hr over {bucket.studies} studies
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground mt-1">Needs at least 3 timed studies in one slot</p>
      )}
    </div>
  )
}

function RateChart({
  title,
  data,
  best,
  money,
  tickEvery,
}: {
  title: string
  data: RateBucket[]
  best: RateBucket | null
  money: (n: number) => string
  tickEvery: number // label every (n + 1)th bar
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "#d1d5db" }}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            interval={tickEvery}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={(v: number) => money(v).replace(/\.00$/, "")}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const b = payload[0].payload as RateBucket
              return (
                <div className="rounded-lg border bg-white p-2 text-sm shadow-sm">
                  <p className="font-medium">{b.label}</p>
                  {b.studies > 0 ? (
                    <>
                      <p>{money(b.rate)}/hr</p>
                      <p className="text-muted-foreground">
                        {money(b.earned)} · {formatMinutes(b.minutes)} · {b.studies}{" "}
                        {b.studies === 1 ? "study" : "studies"}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">No timed studies</p>
                  )}
                </div>
              )
            }}
          />
          <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {data.map((b) => (
              <Cell key={b.key} fill={best && b.key === best.key ? BAR_BEST : BAR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  )
}

const pct = (v: number | null) => (v === null ? "–" : `${(v * 100).toFixed(1)}%`)

function formatMinutes(minutes: number): string {
  const m = Math.round(minutes)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

function formatDay(d: Date): string {
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

function fullWeekday(short: string): string {
  const names: Record<string, string> = {
    Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
  }
  return names[short] ?? short
}
