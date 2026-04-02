"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts"
import { toast } from "sonner"

const COLORS = ["#22c55e", "#eab308", "#6b7280", "#ef4444", "#3b82f6", "#f97316"]

interface StatusBreakdown {
  status: string
  count: number
  amountGBP: number
  amountUSD: number
  percentage: number
}

interface DailyData {
  date: string
  amountGBP: number
  amountUSD: number
  count: number
}

interface AnalyticsData {
  summary: {
    today: { totalGBP: number; totalUSD: number; count: number }
    week: { totalGBP: number; totalUSD: number; count: number }
    month: { totalGBP: number; totalUSD: number; count: number }
    allTime: { totalGBP: number; totalUSD: number; count: number }
  }
  currency: string
  daily: DailyData[]
  statusBreakdown: StatusBreakdown[]
  averageHourlyRate: number
  averageStudyDuration: number
  totalStudies: number
  weekly: {
    earningsGBP: number
    earningsUSD: number
    goal: number
    currency: string
    studyCount: number
  }
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      toast.error("Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your Prolific earnings</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Failed to load analytics. Please try refreshing the page.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights into your Prolific earnings
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Hourly Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              £{(analytics.averageHourlyRate || 0).toFixed(2)}/hr
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Studies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalStudies || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Study Duration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(analytics.averageStudyDuration || 0)} min
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Distribution of study statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.statusBreakdown && analytics.statusBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.statusBreakdown}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {analytics.statusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => {
                        if (typeof value === "number") {
                          return [`${value} studies`, name];
                        }
                        return ["N/A", name];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {analytics.statusBreakdown.map((item, index) => (
                    <div key={item.status} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm truncate">
                        {item.status}: {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No status data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Summary</CardTitle>
            <CardDescription>Earnings breakdown by status (dual currency)</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.statusBreakdown && analytics.statusBreakdown.length > 0 ? (
              <div className="space-y-3">
                {analytics.statusBreakdown.map((item, index) => (
                  <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{item.status}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{item.count} studies</div>
                      {/* 🔥 FIX: Use amountGBP and amountUSD */}
                      <div className="text-sm text-green-600">
                        £{(item.amountGBP || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-blue-600">
                        ${(item.amountUSD || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No status data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Earnings Chart - Dual Currency */}
      {analytics.daily && analytics.daily.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Earnings (Last 30 Days)</CardTitle>
            <CardDescription>Your earning pattern over time (GBP & USD)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analytics.daily.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return `${date.getMonth() + 1}/${date.getDate()}`
                  }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) => `£${value}`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null
                    const data = payload[0].payload as DailyData
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-semibold">{new Date(label ?? "").toLocaleDateString()}</p>
                        <p className="text-green-600">£{(data.amountGBP || 0).toFixed(2)}</p>
                        <p className="text-blue-600">${(data.amountUSD || 0).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{data.count} studies</p>
                      </div>
                    )
                  }}
                />
                <Legend />
                {/* 🔥 FIX: Use amountGBP instead of amount */}
                <Bar dataKey="amountGBP" fill="#22c55e" name="GBP (£)" />
                <Bar dataKey="amountUSD" fill="#3b82f6" name="USD ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* All-Time Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>All-Time Summary</CardTitle>
          <CardDescription>Your total earnings across all studies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-muted-foreground">Today</div>
              <div className="text-xl font-bold text-green-600">
                £{(analytics.summary.today.totalGBP || 0).toFixed(2)}
              </div>
              <div className="text-sm text-blue-600">
                ${(analytics.summary.today.totalUSD || 0).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {analytics.summary.today.count} studies
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-muted-foreground">This Week</div>
              <div className="text-xl font-bold text-green-600">
                £{(analytics.summary.week.totalGBP || 0).toFixed(2)}
              </div>
              <div className="text-sm text-blue-600">
                ${(analytics.summary.week.totalUSD || 0).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {analytics.summary.week.count} studies
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-muted-foreground">This Month</div>
              <div className="text-xl font-bold text-green-600">
                £{(analytics.summary.month.totalGBP || 0).toFixed(2)}
              </div>
              <div className="text-sm text-blue-600">
                ${(analytics.summary.month.totalUSD || 0).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {analytics.summary.month.count} studies
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-muted-foreground">All Time</div>
              <div className="text-xl font-bold text-green-600">
                £{(analytics.summary.allTime.totalGBP || 0).toFixed(2)}
              </div>
              <div className="text-sm text-blue-600">
                ${(analytics.summary.allTime.totalUSD || 0).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {analytics.summary.allTime.count} studies
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
