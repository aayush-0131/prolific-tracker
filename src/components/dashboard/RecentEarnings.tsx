import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, truncateText } from "@/lib/utils"
import { getStatusColor, getStatusDisplay } from "@/lib/earnings-calculator"
import { formatDateTime, getRelativeTime } from "@/lib/date-utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface Earning {
  id: string
  studyTitle: string
  totalEarning: number
  rewardCurrency: string
  status: string
  startedAt: Date | null
}

interface RecentEarningsProps {
  earnings: Earning[]
}

export default function RecentEarnings({ earnings }: RecentEarningsProps) {
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
                    <p className="font-semibold">
                      {formatCurrency(earning.totalEarning, earning.rewardCurrency)}
                    </p>
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
