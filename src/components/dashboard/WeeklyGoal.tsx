"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, Calendar } from "lucide-react"

interface WeeklyGoalProps {
  weeklyEarnings: number
  weeklyGoal: number
  currency: string
  studyCount: number
}

export function WeeklyGoal({ weeklyEarnings, weeklyGoal, currency, studyCount }: WeeklyGoalProps) {
  const progress = Math.min((weeklyEarnings / weeklyGoal) * 100, 100)
  const remaining = Math.max(weeklyGoal - weeklyEarnings, 0)
  const currencySymbol = currency === "GBP" ? "£" : "$"

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Weekly Goal
        </CardTitle>
        <CardDescription>
          Target: {currencySymbol}{weeklyGoal.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-primary">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Earned</p>
              <p className="text-2xl font-bold">
                {currencySymbol}{weeklyEarnings.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                <Calendar className="inline h-3 w-3 mr-1" />
                {studyCount} studies
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Remaining</p>
              <p className="text-2xl font-bold text-orange-600">
                {currencySymbol}{remaining.toFixed(2)}
              </p>
              {progress > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  {progress >= 100 ? "Goal reached!" : `${(100 - progress).toFixed(0)}% to go`}
                </p>
              )}
            </div>
          </div>

          {/* Success Message */}
          {progress >= 100 && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md text-center font-medium">
              🎉 Congratulations! You've hit your weekly goal!
            </div>
          )}

          {/* Motivational Message */}
          {progress > 0 && progress < 100 && (
            <div className="bg-blue-50 text-blue-700 text-xs p-2 rounded-md text-center">
              Keep it up! You're {progress.toFixed(0)}% there 💪
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
