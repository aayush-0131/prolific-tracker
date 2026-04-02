"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import EarningsChart from "@/components/dashboard/EarningsChart"
import RecentEarnings from "@/components/dashboard/RecentEarnings"
import StatsCards from "@/components/dashboard/StatsCards"
import { Target } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface AnalyticsData {
  summary: {
    today: {
      totalGBP: number
      totalUSD: number
      approvedGBP: number
      approvedUSD: number
      pendingGBP: number
      pendingUSD: number
      count: number
    }
    week: {
      totalGBP: number
      totalUSD: number
      approvedGBP: number
      approvedUSD: number
      pendingGBP: number
      pendingUSD: number
      count: number
    }
    month: {
      totalGBP: number
      totalUSD: number
      approvedGBP: number
      approvedUSD: number
      pendingGBP: number
      pendingUSD: number
      count: number
    }
    allTime: {
      totalGBP: number
      totalUSD: number
      approvedGBP: number
      approvedUSD: number
      pendingGBP: number
      pendingUSD: number
      count: number
    }
  }
  currency: string
  daily: Array<{
    date: string
    amountGBP: number
    amountUSD: number
    count: number
  }>
  weekly: {
    earningsGBP: number
    earningsUSD: number
    goal: number
    currency: string
    studyCount: number
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics")
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!analytics) {
    return <div>Failed to load analytics</div>
  }

  const weeklyProgress = analytics.weekly.goal > 0
    ? ((analytics.weekly.currency === "GBP" ? analytics.weekly.earningsGBP : analytics.weekly.earningsUSD) / analytics.weekly.goal) * 100
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || "User"}!
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards analytics={analytics} />

      {/* Weekly Goal Card */}
      {analytics.weekly.goal > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <CardTitle>Weekly Goal</CardTitle>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  £{analytics.weekly.earningsGBP.toFixed(2)} / ${analytics.weekly.earningsUSD.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  of {analytics.weekly.currency === "GBP" ? "£" : "$"}{analytics.weekly.goal.toFixed(2)} goal
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={Math.min(weeklyProgress, 100)} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{analytics.weekly.studyCount} studies this week</span>
              <span>{weeklyProgress.toFixed(0)}% complete</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earnings Chart */}
      <EarningsChart data={analytics.daily} currency={analytics.currency} />

      {/* Recent Earnings */}
      <RecentEarnings />
    </div>
  )
}
