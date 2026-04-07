"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"
import { toast } from "sonner"

interface DailyEarning {
  date: string
  amount: number
  count: number
  studies: Array<{
    id: string
    studyTitle: string
    totalEarning: number
    status: string
  }>
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [earnings, setEarnings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      const response = await fetch("/api/earnings")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setEarnings(data.earnings || []) // ✅ FIX: Extract earnings array
    } catch (error) {
      toast.error("Failed to load earnings")
    } finally {
      setLoading(false)
    }
  }

  // Group earnings by date
  const dailyEarnings = earnings.reduce((acc: Record<string, DailyEarning>, earning) => {
    if (!earning.startedAt) return acc

    const dateKey = format(new Date(earning.startedAt), "yyyy-MM-dd")

    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        amount: 0,
        count: 0,
        studies: []
      }
    }

    const shouldCount = ["APPROVED", "SCREENED OUT"].includes(earning.status)

    if (shouldCount) {
      acc[dateKey].amount += earning.totalEarning
    }

    acc[dateKey].count += 1
    acc[dateKey].studies.push({
      id: earning.id,
      studyTitle: earning.studyTitle,
      totalEarning: earning.totalEarning,
      status: earning.status
    })

    return acc
  }, {})

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get day of week for first day (0 = Sunday)
  const firstDayOfWeek = monthStart.getDay()
  const emptyDays = Array(firstDayOfWeek).fill(null)

  const selectedDateData = selectedDate
    ? dailyEarnings[format(selectedDate, "yyyy-MM-dd")]
    : null

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          View your earnings by day
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Calendar days */}
            {daysInMonth.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd")
              const dayData = dailyEarnings[dateKey]
              const isToday = isSameDay(day, new Date())
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const hasEarnings = dayData && dayData.amount > 0

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square p-2 rounded-lg border transition-all
                    ${isToday ? "border-blue-500 font-bold" : "border-gray-200"}
                    ${isSelected ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"}
                    ${!isSameMonth(day, currentDate) ? "text-gray-300" : ""}
                    ${hasEarnings ? "bg-green-50" : ""}
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span className={`text-sm ${isToday ? "text-blue-600" : ""}`}>
                      {format(day, "d")}
                    </span>
                    {dayData && (
                      <div className="mt-1">
                        <div className="text-xs font-semibold text-green-600">
                          {formatCurrency(dayData.amount, "GBP")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {dayData.count} {dayData.count === 1 ? "study" : "studies"}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>{format(selectedDate, "MMMM d, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-muted-foreground">Total for this day:</span>
                  <span className="text-2xl font-bold">
                    {formatCurrency(selectedDateData.amount, "GBP")}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Studies completed:</h4>
                  {selectedDateData.studies.map((study) => (
                    <div
                      key={study.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{study.studyTitle}</p>
                        <Badge variant="outline" className="mt-1">
                          {study.status}
                        </Badge>
                      </div>
                      <span className="font-semibold ml-4">
                        {formatCurrency(study.totalEarning, "GBP")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No earnings on this day
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
