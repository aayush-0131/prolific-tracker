"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import StatsCards from "@/components/dashboard/StatsCards"
import EarningsChart from "@/components/dashboard/EarningsChart"
import RecentEarnings from "@/components/dashboard/RecentEarnings"
import { WeeklyGoal } from "@/components/dashboard/WeeklyGoal"
import { KofiButton } from "@/components/ui/kofi-button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<any>(null)
  const [recentEarnings, setRecentEarnings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch analytics
        const analyticsRes = await fetch("/api/analytics")
        if (!analyticsRes.ok) throw new Error("Failed to fetch analytics")
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData)

        // Fetch recent earnings
        const earningsRes = await fetch("/api/earnings?limit=5")
        if (!earningsRes.ok) throw new Error("Failed to fetch earnings")
        const earningsData = await earningsRes.json()
        setRecentEarnings(earningsData)
      } catch (error) {
        console.error("Dashboard error:", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchData()
    }
  }, [session])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!analytics) {
    return <div>Failed to load data</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || "User"}!
        </p>
      </div>

      {/* Ko-fi Alert (subtle, top of page) */}
      <KofiButton variant="alert" />

      <StatsCards stats={analytics.summary} />

      {/* Weekly Goal Widget - NEW! */}
      {analytics.weekly && (
        <WeeklyGoal
          weeklyEarnings={analytics.weekly.earnings}
          weeklyGoal={analytics.weekly.goal}
          currency={analytics.weekly.currency}
          studyCount={analytics.weekly.studyCount}
        />
      )}

      <EarningsChart data={analytics.daily} />

      <RecentEarnings earnings={recentEarnings} />
    </div>
  )
}
