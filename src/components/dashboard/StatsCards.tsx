import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calendar, BarChart3 } from "lucide-react"

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
        const hasNativeEarnings = card.data.nativeGBP > 0 || card.data.nativeUSD > 0

        return (
          <Card key={card.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Combined Total (Primary - Large) */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    £{card.data.combinedGBP.toFixed(2)}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    / ${card.data.combinedUSD.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Native Currency (Secondary - Small) */}
              {hasNativeEarnings && (
                <div className="pt-2 border-t border-dashed">
                  <p className="text-xs text-muted-foreground mb-1">
                    Native earnings
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    {card.data.nativeGBP > 0 && (
                      <span className="font-medium text-emerald-600">
                        £{card.data.nativeGBP.toFixed(2)}
                      </span>
                    )}
                    {card.data.nativeGBP > 0 && card.data.nativeUSD > 0 && (
                      <span className="text-muted-foreground">+</span>
                    )}
                    {card.data.nativeUSD > 0 && (
                      <span className="font-medium text-blue-600">
                        ${card.data.nativeUSD.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Study Count */}
              <p className="text-xs text-muted-foreground">
                {card.data.count} {card.data.count === 1 ? "study" : "studies"}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
