import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calendar, BarChart3 } from "lucide-react"

interface StatsCardsProps {
  analytics: {
    summary: {
      today: { totalGBP: number; totalUSD: number; count: number }
      week: { totalGBP: number; totalUSD: number; count: number }
      month: { totalGBP: number; totalUSD: number; count: number }
      allTime: { totalGBP: number; totalUSD: number; count: number }
    }
    currency: string
  }
}

export default function StatsCards({ analytics }: StatsCardsProps) {
  const { summary } = analytics

  const cards = [
    {
      title: "Today",
      gbp: summary.today.totalGBP,
      usd: summary.today.totalUSD,
      count: summary.today.count,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "This Week",
      gbp: summary.week.totalGBP,
      usd: summary.week.totalUSD,
      count: summary.week.count,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "This Month",
      gbp: summary.month.totalGBP,
      usd: summary.month.totalUSD,
      count: summary.month.count,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "All Time",
      gbp: summary.allTime.totalGBP,
      usd: summary.allTime.totalUSD,
      count: summary.allTime.count,
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  £{card.gbp.toFixed(2)}
                </div>
                <div className="text-lg text-muted-foreground">
                  ${card.usd.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.count} {card.count === 1 ? "study" : "studies"}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
