import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calendar, BarChart3 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface StatsCardsProps {
  analytics: {
    summary: {
      today: {
        nativeGBP: number
        nativeUSD: number
        combinedGBP: number
        combinedUSD: number
        count: number
      }
      week: {
        nativeGBP: number
        nativeUSD: number
        combinedGBP: number
        combinedUSD: number
        count: number
      }
      month: {
        nativeGBP: number
        nativeUSD: number
        combinedGBP: number
        combinedUSD: number
        count: number
      }
      allTime: {
        nativeGBP: number
        nativeUSD: number
        combinedGBP: number
        combinedUSD: number
        count: number
      }
    }
    currency: string
  }
}

export default function StatsCards({ analytics }: StatsCardsProps) {
  const { summary } = analytics

  const cards = [
    {
      title: "Today",
      data: summary.today,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "This Week",
      data: summary.week,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "This Month",
      data: summary.month,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "All Time",
      data: summary.allTime,
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
            <CardContent className="space-y-3">
              {/* Native Currency Section (matches Prolific) */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Native Currency
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">
                    £{card.data.nativeGBP.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">|</span>
                  <span className="font-semibold">
                    ${card.data.nativeUSD.toFixed(2)}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Combined Total Section */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Combined Total
                </p>
                <div className="text-2xl font-bold">
                  £{card.data.combinedGBP.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  ${card.data.combinedUSD.toFixed(2)}
                </div>
              </div>

              {/* Study Count */}
              <p className="text-xs text-muted-foreground pt-2">
                {card.data.count} {card.data.count === 1 ? "study" : "studies"}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
