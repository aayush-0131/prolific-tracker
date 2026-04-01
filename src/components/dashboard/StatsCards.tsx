import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number
  currency?: string
  change?: number
  count?: number
}

function StatCard({ title, value, currency = "GBP", change, count }: StatCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0
  const isNeutral = change === 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(value, currency)}
        </div>
        <div className="flex items-center justify-between mt-2">
          {count !== undefined && (
            <p className="text-xs text-muted-foreground">
              {count} {count === 1 ? "study" : "studies"}
            </p>
          )}
          {change !== undefined && (
            <div className="flex items-center text-xs">
              {isPositive && (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                  <span className="text-green-600">+{change.toFixed(1)}%</span>
                </>
              )}
              {isNegative && (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                  <span className="text-red-600">{change.toFixed(1)}%</span>
                </>
              )}
              {isNeutral && (
                <>
                  <Minus className="mr-1 h-3 w-3 text-gray-400" />
                  <span className="text-gray-400">0%</span>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsCardsProps {
  stats: {
    today: { total: number; count: number }
    week: { total: number; count: number }
    month: { total: number; count: number }
    allTime: { total: number; count: number }
  }
  currency?: string
}

export default function StatsCards({ stats, currency = "GBP" }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Today"
        value={stats.today.total}
        currency={currency}
        count={stats.today.count}
      />
      <StatCard
        title="This Week"
        value={stats.week.total}
        currency={currency}
        count={stats.week.count}
      />
      <StatCard
        title="This Month"
        value={stats.month.total}
        currency={currency}
        count={stats.month.count}
      />
      <StatCard
        title="All Time"
        value={stats.allTime.total}
        currency={currency}
        count={stats.allTime.count}
      />
    </div>
  )
}
