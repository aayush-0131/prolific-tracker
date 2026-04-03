"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, truncateText } from "@/lib/utils"
import { getStatusColor, getStatusDisplay } from "@/lib/earnings-calculator"
import { getRelativeTime } from "@/lib/date-utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface Earning {
  id: string
  studyTitle: string
  totalEarning: number
  normalizedGBP: number
  normalizedUSD: number
  rewardCurrency: string
  status: string
  startedAt: Date | null
}

export default function RecentEarnings() {
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await fetch("/api/earnings?limit=5")
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        setEarnings(data.earnings || []) // ✅ FIX: Extract earnings array
      } catch (error) {
        console.error("Error fetching earnings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEarnings()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
          <CardDescription>Your latest study completions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Earnings</CardTitle>
            <CardDescription>Your latest study completions</CardDescription>
          </div>
          <Link href="/earnings">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {earnings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No earnings yet. Upload your Prolific CSV or add a manual entry to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {earnings.map((earning) => (
              <div
                key={earning.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {truncateText(earning.studyTitle, 60)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {earning.startedAt ? getRelativeTime(earning.startedAt) : "Unknown date"}
                  </p>
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  <Badge variant="outline" className={getStatusColor(earning.status)}>
                    {getStatusDisplay(earning.status)}
                  </Badge>
                  <div className="text-right">
                    {/* ✅ FIX: Show native currency first */}
                    <div className="font-semibold text-sm">
                      {earning.rewardCurrency === "GBP"
                        ? `£${earning.totalEarning?.toFixed(2) || "0.00"}`
                        : `$${earning.totalEarning?.toFixed(2) || "0.00"}`
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {/* Show converted amount as reference */}
                      {earning.rewardCurrency === "GBP"
                        ? `≈ $${earning.normalizedUSD?.toFixed(2) || "0.00"}`
                        : `≈ £${earning.normalizedGBP?.toFixed(2) || "0.00"}`
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
