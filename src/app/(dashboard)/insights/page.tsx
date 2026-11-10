"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { InsightsView } from "@/components/insights/InsightsView"
import type { Currency } from "@/lib/earning-rules"
import type { InsightEarning } from "@/lib/insights"

export default function InsightsPage() {
  const [earnings, setEarnings] = useState<InsightEarning[]>([])
  const [currency, setCurrency] = useState<Currency>("GBP")
  const [fiscalYearStart, setFiscalYearStart] = useState(1)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetch("/api/earnings")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch")
        return r.json()
      })
      .then((data) => {
        setEarnings(data.earnings || [])
        setCurrency(data.currency === "USD" ? "USD" : "GBP")
        setFiscalYearStart(data.fiscalYearStart || 1)
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Insights</h1>
        <p className="text-muted-foreground">
          What your Prolific history says about your tax year, your best hours and your account
        </p>
      </div>
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-80" />
          <Skeleton className="h-32" />
        </div>
      ) : failed ? (
        <p className="text-muted-foreground">Failed to load your earnings. Please refresh the page.</p>
      ) : (
        <InsightsView earnings={earnings} currency={currency} fiscalYearStart={fiscalYearStart} />
      )}
    </div>
  )
}
