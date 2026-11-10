"use client"

import { useMemo, useSyncExternalStore } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { InsightsView } from "@/components/insights/InsightsView"
import { generateDemoEarnings } from "@/lib/demo-data"
import { amountIn, isCountable, paidCurrency, realizedHourlyRate, sumCountable } from "@/lib/earning-rules"
import { getStatusColor, getStatusDisplay } from "@/lib/earnings-calculator"
import { getRelativeTime } from "@/lib/date-utils"
import { formatCurrency } from "@/lib/utils"

// Sample data is generated in the browser from the visitor's current date, so the
// demo always looks recent. Nothing is fetched or stored.
const noopSubscribe = () => () => {}

export function DemoDashboard() {
  // false during the server prerender, true in the browser (no hydration mismatch)
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const now = useMemo(() => (isClient ? new Date() : null), [isClient])
  const earnings = useMemo(() => (now ? generateDemoEarnings(now) : []), [now])

  if (!now) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
        <Skeleton className="h-80" />
      </div>
    )
  }

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonth = earnings.filter((e) => e.startedAt && new Date(e.startedAt) >= monthStart)
  const pending = earnings.filter((e) => e.status === "AWAITING REVIEW")
  const recentPaid = earnings.filter(isCountable).slice(0, 5)
  const gbp = (n: number) => formatCurrency(n, "GBP")

  const tiles = [
    { label: "All time", value: gbp(sumCountable(earnings, "GBP")), hint: `${earnings.filter(isCountable).length} paid studies` },
    { label: "This month", value: gbp(sumCountable(thisMonth, "GBP")), hint: `${thisMonth.length} submissions` },
    { label: "Real hourly rate", value: `${gbp(realizedHourlyRate(earnings, "GBP"))}/hr`, hint: "total earned ÷ time spent" },
    { label: "Awaiting review", value: gbp(pending.reduce((s, e) => s + amountIn(e, "GBP"), 0)), hint: `${pending.length} studies pending` },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{t.label}</p>
              <p className="text-2xl font-bold">{t.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent paid studies</CardTitle>
          <CardDescription>Each amount is shown in the currency it was paid in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentPaid.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{e.studyTitle}</p>
                <p className="text-xs text-muted-foreground">{e.startedAt ? getRelativeTime(e.startedAt) : ""}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="outline" className={getStatusColor(e.status)}>{getStatusDisplay(e.status)}</Badge>
                <span className="text-sm font-semibold">{formatCurrency(e.totalEarning, paidCurrency(e))}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <InsightsView earnings={earnings} currency="GBP" fiscalYearStart={4} />
    </div>
  )
}
